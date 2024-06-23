// CardBody.js
import React from 'react';
import PropTypes from 'prop-types';
import './card.css'; // Import a CSS file for styling (optional)

const CardBody = ({ title, content, imageUrl }) => {
  return (
    <div className="card-body">
      {imageUrl && <img src={imageUrl} alt={title} className="card-img-top" />}
      <div className="card-content">
        {title && <h5 className="card-title">{title}</h5>}
        {content && <p className="card-text">{content}</p>}
      </div>
    </div>
  );
};

CardBody.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  imageUrl: PropTypes.string,
};

CardBody.defaultProps = {
  title: '',
  content: '',
  imageUrl: '',
};

export default CardBody;
