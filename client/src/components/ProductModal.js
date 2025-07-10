import React from 'react';
import { Modal, Row, Col, Badge } from 'react-bootstrap';
import ImageWithFallback from './ImageWithFallback';

const ProductModal = ({ show, onHide, product }) => {
  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{product.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="product-detail-image"
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            />
          </Col>
          <Col md={6}>
            <h4>{product.name}</h4>
            
            <div className="mb-3">
              <h5>Price</h5>
              {product.discount > 0 ? (
                <div>
                  <span className="text-decoration-line-through text-muted me-2">
                    {formatPrice(product.price)}
                  </span>
                  <span className="h4 text-success">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <Badge bg="success" className="ms-2">
                    {product.discount}% OFF
                  </Badge>
                </div>
              ) : (
                <span className="h4">{formatPrice(product.price)}</span>
              )}
            </div>

            <div className="mb-3">
              <h5>Category</h5>
              <p>{product.category?.name}</p>
            </div>

            <div className="mb-3">
              <h5>Brand</h5>
              <p>{product.brand?.name}</p>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="mb-3">
                <h5>Tags</h5>
                <div>
                  {product.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Col>
        </Row>
        
        {product.description && (
          <Row className="mt-4">
            <Col>
              <h5>Description</h5>
              <p>{product.description}</p>
            </Col>
          </Row>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ProductModal;
