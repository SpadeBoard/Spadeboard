-- FIXME: All the dynamic queries, make sure to actually pass in parameters correctly
-- TODO: Figure out how to combine all the discrete returning queries back into one frontend model

-- ASSUMPTIONS:
-- All styling for card and dnd item is dynamic because we will never render a card by itself
-- All aspects of a card and card face will be updated or created simultaneously
-- Not sure about deletion
CREATE OR REPLACE PROCEDURE get_cards(
    IN p_owner_id INTEGER,
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_owner_id IS NULL
        RAISE EXCEPTION 'Owner ID is required';
    END IF;

    /*
    | card_id | front_card_face_id | back_card_face_id | owner_id | is_flipped | dnd_item_id | is_draggable: true | is_droppable | dnd_position | dnd_drag_boundary | style_id |
    |   |   |   |   |
    */

    SELECT c.*, di.*, 0 AS style_id
    FROM card AS c
    INNER JOIN card_face AS fcf ON c.front_card_face_id = fcf.card_face_id
    INNER JOIN card_face AS bcf ON c.back_card_face_id = bcf.card_face_id
    INNER JOIN dnd_item AS di ON c.dnd_item_id = di.dnd_item_id
    WHERE c.owner_id = p_owner_id; 
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback the transaction if any error occurs
        ROLLBACK;
        RAISE;
END;
$$
;

CREATE OR REPLACE PROCEDURE get_card(
    IN p_card_id INTEGER,
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_card_id IS NULL
        RAISE EXCEPTION 'Card ID is required';
    END IF;

    SELECT c.*, di.*, 0 AS style_id
    FROM card AS c
    INNER JOIN card_face AS fcf ON c.front_card_face_id = fcf.card_face_id
    INNER JOIN card_face AS bcf ON c.back_card_face_id = bcf.card_face_id
    INNER JOIN dnd_item AS di ON c.dnd_item_id = di.dnd_item_id
    WHERE c.card_id = p_card_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback the transaction if any error occurs
        ROLLBACK;
        RAISE;
END;
$$
;

/*
STYLE ELEMENTS EXAMPLE:
Should just be one object
{
    accent_color:
    align_content:
    align_Items:
    align_self:
    all:
}
*/

-- TODO: Catch errors and send them back up

-- TODO: Make these separated elements into a JSONB type?
CREATE OR REPLACE PROCEDURE create_card(
    p_card JSONB,
    p_dnd_item JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    dnd_item_fields TEXT[];
    dnd_item_values TEXT[];
    dnd_item_insert_query TEXT;
    new_dnd_item_id INTEGER;

    card_fields TEXT[];
    card_values TEXT[];
    card_insert_query TEXT;
    new_card_id INTEGER;
BEGIN
    IF p_card IS NULL
        RAISE EXCEPTION 'Card is required';
    END IF;

    IF p_dnd_item IS NULL
        RAISE EXCEPTION 'Dnd Item is required';
    END IF;

    -- TODO: If style already exists, don't add to it
    -- PURPOSE: This is to make sure we can pass in optional parameters
    SELECT ARRAY(SELECT jsonb_object_keys(p_dnd_item)) INTO dnd_item_fields;
    SELECT ARRAY(SELECT value::text FROM jsonb_each(p_dnd_item)) INTO dnd_item_values;

    -- We make a dynamic query essentially
    -- '%L' is a placeholder in PostgreSQL for literal values that need to be properly quoted and escaped.
    dnd_item_insert_query := format(
        'INSERT INTO dnd_item (%s) VALUES (%s) RETURNING dnd_item_id',
        array_to_string(dnd_item_fields, ', '),
        array_to_string(array_fill('%L'::text, ARRAY[array_length(dnd_item_values, 1)]), ', ')
    );
    
    EXECUTE  dnd_item_insert_query 
        INTO new_dnd_item_id;

    SELECT ARRAY(SELECT jsonb_object_keys(p_card)) INTO card_fields;
    SELECT ARRAY(SELECT value::text FROM jsonb_each(p_card)) INTO card_values;

    -- We make a dynamic query essentially
    -- '%L' is a placeholder in PostgreSQL for literal values that need to be properly quoted and escaped.
    card_insert_query := format(
        'INSERT INTO card (dnd_item_id, %s) VALUES ($1, %s) RETURNING card_id',
        array_to_string(card_fields, ', '),
        array_to_string(array_fill('%L'::text, ARRAY[array_length(card_values, 1)]), ', ')
    );
    
    EXECUTE card_insert_query 
        USING new_dnd_item_id
        INTO new_card_id;
    
    RETURN (SELECT * FROM get_card(new_card_id));
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback the transaction if any error occurs
        ROLLBACK;
        RAISE;
END;
$$
;

/*
STYLE ELEMENTS EXAMPLE:
Should just be one object
{
    accent_color: #ffffff
    align_content: center
    align_items: center
    align_self: center
    all: initial
}
*/

CREATE OR REPLACE PROCEDURE update_card(
    p_card JSONB,
    p_dnd_item JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    dnd_item_id_update INTEGER;
    dnd_item_fields TEXT[];
    dnd_item_values TEXT[];
    dnd_item_update_query TEXT;

    card_id_update INTEGER;
    card_fields TEXT[];
    card_values TEXT[];
    card_update_query TEXT;
BEGIN
    /*************************** DND ITEM *******************************/
    SELECT (p_dnd_item::json->'dnd_item_key')::INTEGER
        INTO dnd_item_id_update;

    -- FIXME: Gotta grab the Dnd Item ID and set that too
    -- FIXME: Get rid of styling, make a CTE, then selecting the array based on that CTE and so on
    WITH dnd_item_cte AS (
        SELECT (
            array_to_string(
                ARRAY(
                    SELECT value
                    FROM jsonb_each(dnd_item_attributes) AS pair(key, value)
                    WHERE key != 'dnd_item_id'
                ),
                ', '
            ) AS dnd_item_keys, -- FIXME: Fix this, gotta filter correctly,
            array_to_string(
                ARRAY(
                    SELECT value
                    FROM jsonb_each(dnd_item_attributes) AS pair(key, value)
                    WHERE key != 'dnd_item_id'
                ),
                ', '
            ) AS dnd_item_values
        )
        FROM jsonb_array_elements(p_dnd_item) AS dnd_item_attributes
    )
    SELECT 
        ARRAY(SELECT jsonb_object_keys(dnd_item_cte.dnd_item_keys)) INTO dnd_item_fields,
        ARRAY(SELECT value::text FROM jsonb_each(dnd_item_cte.dnd_item_values)) INTO dnd_item_values;

    -- We make a dynamic query essentially
    -- '%I' is used for identifiers (column names), '%L' for literal values
    dnd_item_update_query := format(
        'UPDATE dnd_item SET %s WHERE dnd_item_id = $1',
        array_to_string(array_agg(format('%I = %L', dnd_item_fields[i], dnd_item_values[i])), ', ')
    );
    
    EXECUTE dnd_item_update_query
        USING dnd_item_id_update;

    /*************************** CARD *******************************/
    SELECT (p_card::json->'card_key')::INTEGER
        INTO card_id_update;

    -- FIXME: Gotta grab the Dnd Item ID and set that too
    -- FIXME: Get rid of styling, make a CTE, then selecting the array based on that CTE and so on
    WITH card_cte AS (
        SELECT (
            array_to_string(
                ARRAY(
                    SELECT value
                    FROM jsonb_each(card_attributes) AS pair(key, value)
                    WHERE key != 'card_id'
                ),
                ', '
            ) AS card_keys, -- FIXME: Fix this, gotta filter correctly,
            array_to_string(
                ARRAY(
                    SELECT value
                    FROM jsonb_each(card_attributes) AS pair(key, value)
                    WHERE key != 'card_id'
                ),
                ', '
            ) AS card_values
        )
        FROM jsonb_array_elements(p_card) AS card_attributes
    )
    SELECT 
        ARRAY(SELECT jsonb_object_keys(card_cte.card_keys)) INTO card_fields,
        ARRAY(SELECT value::text FROM jsonb_each(card_cte.card_values)) INTO card_values;

    -- Figure out if we need to update the dnd_item_id
    card_update_query := format(
        'UPDATE card SET %s WHERE card_id = $1',
        array_to_string(array_agg(format('%I = %L', card_fields[i], card_values[i])), ', ')
    );
    
    EXECUTE card_update_query
        USING card_id_update;
    
    RETURN (SELECT * FROM get_card(card_id_update);
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback the transaction if any error occurs
        ROLLBACK;
        RAISE;
END;
$$
;

-- TODO: Make sure that there's a flag so that it also deletes the parents
CREATE OR REPLACE PROCEDURE delete_card(
    p_card_id: INTEGER,
    p_delete_all_attributes_associated_with_card BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_delete_all_attributes_associated_with_card THEN
        -- Create a CTE, delete everything else associates with card
        WITH card_deletion AS (
            DELETE FROM card
            WHERE card_id = p_card_id
            RETURNING dnd_item_id, front_card_face_id, back_card_face_id
        ),
        dnd_item_deletion AS (
            DELETE FROM dnd_item
            WHERE dnd_item_id IN (SELECT dnd_item_id FROM card_deletion)
        ),
        card_face_deletion AS (
            DELETE FROM card_face
            WHERE card_face_id IN (
                SELECT front_card_face_id FROM card_deletion
                UNION
                SELECT back_card_face_id FROM card_deletion
            )
        )
        SELECT 1;

        -- TODO: Delete all the card face elements associated with those faces
        -- Actually, maybe not, if we can use one element for multiple faces
        RETURN;
    END IF;

    DELETE
        FROM card
        WHERE card_id = p_card_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback the transaction if any error occurs
        ROLLBACK;
        RAISE;
END;
$$
;

-- PURPOSE
-- For getting all the elements associated with the card face
-- As well as the card face itself
-- This should be used with getting the card ID, if you need to grab the faces associated with a card ID
CREATE OR REPLACE PROCEDURE get_card_faces(
    IN p_card_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT 
        cf.*,
        cfe.*,
        di.*,
        cfs.*,
        cfes.*
    FROM card_face AS cf
    INNER JOIN card AS c ON c.card_face_id = cf.card_face_id
    INNER JOIN style AS cfs ON cf.style_id = cfs.style_id
    INNER JOIN card_face_element AS cfe ON cfe.card_face_id = cf.card_face_id
    INNER JOIN style AS cfes ON cfe.style_id = cfes.style_id
    INNER JOIN dnd_item AS di ON cfe.dnd_item_id = di.dnd_item_id
    WHERE c.card_id = p_card_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback the transaction if any error occurs
        ROLLBACK;
        RAISE;
END;
$$
;

-- PURPOSE
-- For getting all the elements associated with the card face
-- As well as the card face itself
-- This should be used with grabbing the card face directly fro some reason
-- Potentionally for card face editing?
CREATE OR REPLACE PROCEDURE get_card_face(
    -- DJango cursor should be named get_card_face_sp_result
    IN p_card_face_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT 
        cf.*,
        cfs.*,
        cfe.*,
        cfedi.*,
        cfes.*
    FROM card_face AS cf
    INNER JOIN style AS cfs ON cf.style_id = cfs.style_id
    INNER JOIN card_face_element AS cfe ON cfe.card_face_id = cf.card_face_id
    INNER JOIN style AS cfes ON cfe.style_id = cfes.style_id
    INNER JOIN dnd_item AS cfedi ON cfe.dnd_item_id = di.dnd_item_id
    WHERE cf.card_face_id = p_card_face_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback the transaction if any error occurs
        ROLLBACK;
        RAISE;
END;
$$
;

/*
CARD FACE ELEMENTS STRUCTURE
We pass in the IDs too, but they are temporary and are meant to separate the sections
[
    {
        card_face_element_id: 0
        card_face_element_content: "url here"
        
        dnd_item_id: 0
        is_draggable: true
        is_droppable: true
        dnd_position: "{x: 300, y: 300}"
        (?) dnd_drag_boundary: 

        style_id: 0;
        background-position: center;
        position: relative;
    },
    {
        card_face_element_id: 0;
        card_face_element_content: "text here";
        
        dnd_item_id: 0;
        is_draggable: true;
        is_droppable: false;
        dnd_position: "{x: 300, y: 300}";
        (?) dnd_drag_boundary: 

        style_id: 0;
        border_block_end_color: #fffffff;
        accent_color: #ffffff;
        align_content: center;
        align_items: center;
        align_self: center;
    }
]
*/

/*
STYLE ATTRIBUTES EXAMPLE:
Should just be one object
{
    accent_color: #ffffff
    align_content: center
    align_items: center
    align_self: center
    all: initial
}
*/

CREATE OR REPLACE PROCEDURE create_card_face(
    -- TODO: Figure out how to pass in the card face elements, because they also have Dnd Item stuff and styles too
    -- The card_face_elements should reflect the structure of the cardFaceElement model
    p_card_face_style_attributes JSONB,
    p_card_face_elements JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    -- ***************** CARD FACE **********************
    card_face_style_insert_query TEXT;
    card_face_style_id INTEGER;
    new_card_face_id INTEGER;

    card_face_style_fields TEXT ARRAY;
    card_face_style_values TEXT ARRAY;
    -- ******************************************************************************

    -- ***************** CARD FACE ELEMENTS **********************
    card_face_elements_insert_query TEXT;

    cfe_insertion_fields TEXT;
    cfe_dnd_item_insertion_fields TEXT;
    cfe_style_insertion_fields TEXT;

    cfe_insertion_args TEXT;
    cfe_dnd_item_insertion_args TEXT;
    cfe_style_insertion_args TEXT;
    -- ******************************************************************************
BEGIN
    -- TODO: If style already exists, don't add to it
    -- PURPOSE: This is to make sure we can pass in optional parameters
    SELECT ARRAY(SELECT jsonb_object_keys(p_card_face_style_attributes)) INTO card_face_style_fields;
    SELECT ARRAY(SELECT value::text FROM jsonb_each(p_card_face_style_attributes)) INTO card_face_style_values;

    -- CHECKME: Make sure this actually works
    card_face_style_insert_query := format(
        'INSERT INTO style (%s) VALUES (%s) RETURNING style_id',
        array_to_string(card_face_style_fields, ', '),
        array_to_string(card_face_style_values, ', ')
    );
    
    EXECUTE card_face_style_elements_insert_query 
        INTO card_face_style_id;

    INSERT INTO card_face (style_id)
        VALUES (card_face_style_id)
        RETURNING card_face_id INTO new_card_face_id;

    -- TODO: Grab the card face elements, then insert into them, also have to update the Dnd Item and Styles too
    -- Card face element needs the Dnd Item ID and the Style ID

    /*
    index	| 	card_face_element_fields	| 	card_face_element_args	| 	dnd_item_fields	| 	dnd_item_args	| 	style_fields	| 	style_args
    1	| 	card_face_element_content	| 	"url here"	| 	is_draggable, is_droppable, dnd_position, (?) dnd_drag_boundary	| 	true, true, "{x: 300, y: 300}"	| 	background-position, position	| 	center, relative
    2	| 	card_face_element_content	| 	"text here"	| 	is_draggable, is_droppable, dnd_position, (?) dnd_drag_boundary	| 	true, false, "{x: 300, y: 300}"	| 	border_block_end_color, accent_color, align_content, align_items, align_self	| 	#fffffff, #ffffff, center, center, center
    */

    -- Create a for loop, split the elements and then pass them in

    -- https://neon.tech/postgresql/postgresql-json-functions/postgresql-jsonb_array_elements
    -- TODO: Pass in the card face ID
    card_face_elements_insert_query := format(
        'WITH 
            dnd_item_insertion AS (
                INSERT INTO dnd_item (%s)
                VALUES (%s)
                RETURNING dnd_item_id
            ), 
            style_insertion AS (
                INSERT INTO style (%s)
                VALUES (%s)
                RETURNING style_id
            ),
            card_face_element_insertion AS (
                INSERT INTO card_face_element(card_face_id, dnd_item_id, style_id, %s)
                VALUES($1, (SELECT dnd_item_id FROM dnd_item_insertion), (SELECT style_id FROM style_insertion), %s)
            )
        SELECT 1', cfe_dnd_item_insertion_fields, cfe_dnd_item_insertion_args, cfe_style_insertion_fields, cfe_style_insertion_args, cfe_insertion_fields, cfe_insertion_args
    );
    
    WITH card_face_elements_cte AS (
    SELECT 
        row_number() OVER () AS index,
        -- card_face_element, -- Unnecessary
        array_to_string(
            ARRAY(
                SELECT key
                FROM jsonb_each(card_face_element - 'dnd_item_id' - 'style_id') AS pair(key, value)
                WHERE key != 'card_face_element_id'
            ),
            ', '
        ) AS card_face_element_fields,
        array_to_string(
            ARRAY(
                SELECT value
                FROM jsonb_each(card_face_element - 'dnd_item_id' - 'style_id') AS pair(key, value)
                WHERE key != 'card_face_element_id'
            ),
            ', '
        ) AS card_face_element_args, 
        array_to_string(
            ARRAY(
                SELECT key
                FROM jsonb_each(card_face_element - 'card_face_element_id' - 'style_id') AS pair(key, value)
                WHERE key != 'dnd_item_id'
            ),
            ', '
        ) AS dnd_item_fields, 
        array_to_string(
            ARRAY(
                SELECT value
                FROM jsonb_each(card_face_element - 'card_face_element_id' - 'style_id') AS pair(key, value)
                WHERE key != 'dnd_item_id'
            ),
            ', '
        ) AS dnd_item_args,
        array_to_string(
            ARRAY(
                SELECT key
                FROM jsonb_each(card_face_element - 'card_face_element_id' - 'dnd_item_id') AS pair(key, value)
                WHERE key != 'style_id'
            ),
            ', '
        ) AS style_fields,
        array_to_string(
            ARRAY(
                SELECT value
                FROM jsonb_each(card_face_element - 'card_face_element_id' - 'dnd_item_id') AS pair(key, value)
                WHERE key != 'style_id'
            ),
            ', '
        ) AS style_args 
    FROM jsonb_array_elements(p_card_face_elements) AS card_face_element
    )
    -- https://www.postgresql.org/docs/current/plpgsql-control-structures.html
    FOR card_face_element IN SELECT * FROM card_face_elements_cte
    LOOP
        cfe_dnd_item_insertion_fields := card_face_element.dnd_item_fields;
        cfe_dnd_item_insertion_args := card_face_element.dnd_item_args;
        cfe_style_insertion_fields := card_face_element.style_fields;
        cfe_style_insertion_args := card_face_element.style_args;
        cfe_insertion_fields := card_face_element.card_face_element_fields;
        cfe_insertion_args:= card_face_element.card_face_element_args;

        EXECUTE card_face_elements_insert_query
            USING new_card_face_id;
    END LOOP;

    RETURN (SELECT * FROM get_card_face(new_card_face_id));
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback the transaction if any error occurs
        ROLLBACK;
        RAISE;
END;
$$
;

/*
CARD FACE ELEMENTS STRUCTURE
[
    {
        card_face_element_id: 1
        card_face_element_content: "url here"
        
        dnd_item_id: 7
        is_draggable: true
        is_droppable: true
        dnd_position: "{x: 300, y: 300}"
        (?) dnd_drag_boundary: 

        style_id: 78;
        background-position: center;
        position: relative;
    },
    {
        card_face_element_id: 2;
        card_face_element_content: "text here";
        
        dnd_item_id: 4;
        is_draggable: true;
        is_droppable: false;
        dnd_position: "{x: 300, y: 300}";
        (?) dnd_drag_boundary: 

        style_id: 4;
        border_block_end_color: #fffffff;
        accent_color: #ffffff;
        align_content: center;
        align_items: center;
        align_self: center;
    }
]
*/

/*
STYLE ATTRIBUTES EXAMPLE:
Should just be one object
{
    accent_color: #ffffff
    align_content: center
    align_items: center
    align_self: center
    all: initial
}
*/
CREATE OR REPLACE PROCEDURE update_card_face(
    p_card_face_id INTEGER,

    -- PURPOSE: Split the card_face_style_id and card_face_style_attributes as two separate parameters via the frotnend
    p_card_face_style_id INTEGER,
    p_card_face_style_attributes JSONB,

    p_card_face_elements JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    card_face_elements_update_query TEXT;

    cfe_update_args TEXT;
    cfe_dnd_item_update_args TEXT;
    cfe_style_update_args TEXT;

    card_face_style_update_args TEXT[];
    card_face_style_update_query TEXT;
BEGIN
    -- ******************************** CARD FACE STYLE *************************************************************
    SELECT array_agg(format('%I = %L', key, value))
        FROM jsonb_each_text(p_card_face_style_attributes)
        INTO card_face_style_update_args;

    /*
    Array result
    [
        'accent_color = '#ffffff'',
        'align_content = 'center'',
        'align_items = 'center'',
        'align_self = 'center'',
        'all = 'initial''
    ]
    */

    -- Json to recordset https://stackoverflow.com/questions/33330856/how-do-i-select-only-a-specific-keys-value-from-jsonb-type-in-postgres
    -- https://www.postgresql.org/docs/9.6/functions-json.html

    -- FIXME: Pass in correct arguments
    card_face_style_update_query := format(
        'UPDATE style SET %s WHERE style_id = $1',
        array_to_string(card_face_style_update_args, ', ')
    );

    /*
    UPDATE style SET accent_color = '#ffffff', align_content = 'center', align_items = 'center', align_self = 'center', all = 'initial' WHERE style_id = $1
    */
    
    EXECUTE card_face_style_update_query 
        USING p_card_face_style_id;

    -- **************************************************************************************************************************
    -- ******************************** CARD FACE ELEMENT *************************************************************
    -- TODO: Update the Dnd Items, Style, and Card Face Element
    card_face_elements_update_query := format(
        'WITH 
            dnd_item_update AS (
                UPDATE dnd_item 
                SET (%s)
                WHERE dnd_item_id = $1
                RETURNING dnd_item_id
            ), 
            style_update AS (
                UPDATE style (%s)
                SET (%s)
                WHERE style_id = $2
                RETURNING style_id
            ),
            card_face_element_update AS (
                UPDATE card_face_element
                SET dnd_item_id = (SELECT dnd_item_id FROM dnd_item_update), style_id = (SELECT style_id FROM style_update), card_face_id = $4, %s
                WHERE card_face_element_id = $3
            )
        SELECT 1', cfe_dnd_item_update_args, cfe_style_update_args, cfe_update_args
    );

    /*
    SELECT STATEMENT RESULTS
        |	index	| card_face_element_id	| dnd_item_id	| style_id, card_face_element_args | dnd_item_args | style_args
        |	1	|	 1	|	7	| 	78 | "card_face_element_content=url here" | "is_draggable=true, is_droppable=true, dnd_position={x: 300, y: 300}" | "background-position=center, position=relative"
        |	2	| 	2	| 	4	| 	4 | "card_face_element_content=text here" | "is_draggable=true, is_droppable=false, dnd_position={x: 300, y: 300}" | "border_block_end_color=#fffffff, accent_color=#ffffff, align_content=center, align_items=center, align_self=center"
    */
    
    -- TODO: Maybe inside the creation, also have temp ids to do similar to what's below
    WITH card_face_elements_cte AS (
        SELECT 
            row_number() OVER () AS index,
            (card_face_element->>'card_face_element_id')::int AS card_face_element_id,
            (card_face_element->>'dnd_item_id')::int AS dnd_item_id,
            (card_face_element->>'style_id')::int AS style_id,
            (
                SELECT string_agg(key || '=' || value, ', ')
                    FROM jsonb_each_text(card_face_element - 'dnd_item_id' - 'style_id') -- Removes these ids from consideration
                    WHERE key != 'card_face_element_id'
            ) AS card_face_element_args,
            (
                SELECT string_agg(key || '=' || value, ', ')
                    FROM jsonb_each_text(card_face_element - 'card_face_element_id' - 'style_id') -- Removes these ids from consideration
                    WHERE key != 'dnd_item_id'
            ) AS dnd_item_args,
            (
                SELECT string_agg(key || '=' || value, ', ')
                FROM jsonb_each_text(card_face_element - 'card_face_element_id' - 'dnd_item_id') -- Removes these ids from consideration
                WHERE key != 'style_id'
            ) AS style_args
        FROM jsonb_array_elements(p_card_face_elements) AS card_face_element
    )
    -- https://www.postgresql.org/docs/current/plpgsql-control-structures.html
    FOR card_face_element IN SELECT * FROM card_face_elements_cte
    LOOP
        -- ********************** DND ITEM UPDATE ARGS **************************
        cfe_dnd_item_update_args := card_face_element.dnd_item_args;
        
        -- ********************** STYLE UPDATE ARGS **************************
        cfe_style_update_args := card_face_element.style_args;

        -- ********************** CARD FACE ELEMENTS ARGS **************************
        cfe_update_args := card_face_element.card_face_element_args;

        EXECUTE card_face_elements_update_query
            USING card_face_element.dnd_item_id, card_face_element.style_id, card_face_element.card_face_element_id, p_card_face_id;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback the transaction if any error occurs
        ROLLBACK;
        RAISE;
END;
$$
;


CREATE OR REPLACE PROCEDURE delete_card_face(
    p_card_face_id: INTEGER,
    p_delete_all_attributes_associated_with_card_face BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_delete_all_attributes_associated_with_card_face THEN
        -- Create a CTE, delete everything else associates with card
        WITH card_face_deletion AS (
            DELETE FROM card
            WHERE card_face_id = p_card_face_id
            RETURNING dnd_item_id, front_card_face_id, back_card_face_id
        ),
        card_face_style_deletion AS (
            DELETE FROM style
            WHERE style_id IN (SELECT style_id FROM card_face_deletion)
        ),
        card_face_element_deletion AS (
            DELETE FROM card_face_element
            WHERE card_face_id = (SELECT card_face_id FROM card_face_deletion)
        ),
        -- TODO: Figure out whether the card face element holds the style ID or the dnd item
        dnd_item_deletion AS (
            DELETE FROM dnd_item
            WHERE dnd_item_id IN (SELECT dnd_item_id FROM card_face_element_deletion)
        ),
        card_face_element_style_deletion AS (
            DELETE FROM style
            WHERE style_id IN (SELECT style_id FROM card_face_element_deletion)
        ),
        SELECT 1;

        -- TODO: Delete all the card face elements associated with those faces
        -- Actually, maybe not, if we can use one element for multiple faces
        RETURN;
    END IF;

    DELETE
        FROM card_face
        WHERE card_face_id = p_card_face_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback the transaction if any error occurs
        ROLLBACK;
        RAISE;
END;
$$
;