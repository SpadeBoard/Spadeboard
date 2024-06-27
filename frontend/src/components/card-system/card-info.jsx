// CardInfo.js
import React from 'react';
import PropTypes from 'prop-types';
import './card.css'; // Import a CSS file for styling (optional)

const CardInfo = ({ title, content, imageUrl, minHeight, minWidth, aspectRatio, height, width }) => {
  const cardBodyStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "20px",
    margin: "20px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    maxWidth: "100%",
    maxHeight: "100%",
    minHeight: minHeight ? `${minHeight}px` : "320px",
    minWidth: minWidth ? `${minWidth}px` : "182px",
    aspectRatio: aspectRatio ? `${aspectRatio}` : "5/7",
    width: width ? `${width}px` : "182px",
    height: height ? `${height}px` : "320px",
  };

  return (
    <div style={cardBodyStyle}>
      <img src={imageUrl} alt={title} className="card-img-top" />
      <div className="card-content">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{content}</p>
      </div>
    </div>
  );
};

CardInfo.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  imageUrl: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
  aspectRatio: PropTypes.string
};

CardInfo.defaultProps = {
  title: '',
  content: '',
  imageUrl: '',
  height: undefined,
  width: undefined,
  aspectRatio: undefined
};

export default CardInfo;
