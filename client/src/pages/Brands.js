import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import brandService from '../services/brandService';
import productService from '../services/productService';
import ImageWithFallback from '../components/ImageWithFallback';

const Brands = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [brandCounts, setBrandCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, brand: null });
  const [formData, setFormData] = useState({ name: '', description: '', logo: '', website: '' });

  useEffect(() => {
    loadBrands();
    loadBrandCounts();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const response = await brandService.getBrands({ limit: 100 });
      setBrands(response.brands);
    } catch (error) {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const loadBrandCounts = async () => {
    try {
      const brands = await brandService.getBrands({ limit: 100 });
      const counts = {};
      for (const brand of brands.brands) {
        try {
          const products = await productService.getProducts({ brand: brand._id, limit: 1 });
          counts[brand._id] = products.total || 0;
        } catch (error) {
          counts[brand._id] = 0;
        }
      }
      setBrandCounts(counts);
    } catch (error) {
      console.error('Failed to load brand counts:', error);
    }
  };

  const handleBrandClick = (brand, e) => {
    if (e.target.closest('.action-buttons')) return;
    navigate(`/products?brand=${brand._id}`);
  };

  const handleAdd = () => {
    setFormData({ name: '', description: '', logo: '', website: '' });
    setEditingBrand(null);
    setShowModal(true);
  };

  const handleEdit = (brand) => {
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logo: brand.logo || '',
      website: brand.website || ''
    });
    setEditingBrand(brand);
    setShowModal(true);
  };

  const handleDelete = (brand) => {
    setDeleteModal({ show: true, brand });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await brandService.updateBrand(editingBrand._id, formData);
        toast.success('Brand updated successfully');
      } else {
        await brandService.createBrand(formData);
        toast.success('Brand created successfully');
      }
      setShowModal(false);
      loadBrands();
    } catch (error) {
      toast.error(editingBrand ? 'Failed to update brand' : 'Failed to create brand');
    }
  };

  const confirmDelete = async () => {
    try {
      await brandService.deleteBrand(deleteModal.brand._id);
      toast.success('Brand deleted successfully');
      setDeleteModal({ show: false, brand: null });
      loadBrands();
    } catch (error) {
      toast.error('Failed to delete brand');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Clean up navigation effect
  useEffect(() => {
    if (location.state?.brandFilter) {
      toast.info(`Showing products from brand: ${location.state.brandName}`);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate, location.pathname]);

  return (
    <div className="main-content">
      <div className="brands-header-section">
        <div className="header">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 className="mb-0">Brands</h1>
              <p className="text-muted mb-0">Manage your product brands</p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('grid')}
                size="sm"
              >
                <i className="fas fa-th-large me-1"></i>Grid
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('table')}
                size="sm"
              >
                <i className="fas fa-list me-1"></i>Table
              </Button>
              <Button variant="primary" onClick={handleAdd}>
                <i className="fas fa-plus me-2"></i>Add Brand
              </Button>
            </div>
          </div>
        </div>
        <div className="search-bar-section mb-3 mt-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search Brands by name or description..."
            // Add search logic if needed
          />
        </div>
      </div>
      {/* Main Content */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="brands-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              width: '100%',
              margin: '0 auto',
              maxWidth: '1200px',
              padding: '0 16px',
              overflowX: 'hidden'
            }}>
              {brands.map(brand => (
                <div key={brand._id} className="brand-card-container">
                  <Card className="brand-card h-100 shadow-sm" style={{ cursor: 'pointer' }} onClick={(e) => handleBrandClick(brand, e)}>
                    <div className="brand-image-container">
                      <ImageWithFallback src={brand.logo} alt={brand.name} className="brand-image" fallbackSrc="/api/placeholder/300/200" />
                      <div className="brand-overlay">
                        <Badge bg="primary" className="product-count-badge">{brandCounts[brand._id] || 0} Products</Badge>
                      </div>
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <div className="flex-grow-1">
                        <h5 className="brand-title">{brand.name}</h5>
                        <p className="brand-description text-muted">{brand.description || 'No description available'}</p>
                        {brand.website && (
                          <p className="brand-website">
                            <i className="fas fa-globe me-1"></i>
                            <a href={brand.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Website</a>
                          </p>
                        )}
                      </div>
                      <div className="brand-footer">
                        <small className="text-muted">Created: {new Date(brand.createdAt).toLocaleDateString()}</small>
                      </div>
                      <div className="action-buttons mt-2">
                        <Button variant="warning" size="sm" className="me-2" onClick={(e) => { e.stopPropagation(); handleEdit(brand); }}>
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(brand); }}>
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card className="shadow-sm">
              <Card.Body>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Logo</th><th>Name</th><th>Description</th><th>Website</th><th>Products</th><th>Created</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brands.map(brand => (
                        <tr key={brand._id} style={{ cursor: 'pointer' }} onClick={(e) => handleBrandClick(brand, e)}>
                          <td>
                            <ImageWithFallback src={brand.logo} alt={brand.name} className="table-image" fallbackSrc="/api/placeholder/60/60" />
                          </td>
                          <td><strong>{brand.name}</strong></td>
                          <td>{brand.description || 'No description'}</td>
                          <td>
                            {brand.website ? (
                              <a href={brand.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                <i className="fas fa-external-link-alt"></i>
                              </a>
                            ) : 'No website'}
                          </td>
                          <td><Badge bg="primary">{brandCounts[brand._id] || 0} Products</Badge></td>
                          <td>{new Date(brand.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons d-flex gap-2">
                              <Button variant="warning" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(brand); }}>Edit</Button>
                              <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(brand); }}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingBrand ? 'Edit Brand' : 'Add Brand'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Logo URL</Form.Label>
              <Form.Control type="url" name="logo" value={formData.logo} onChange={handleInputChange} />
              {formData.logo && (
                <div className="mt-2">
                  <img src={formData.logo} alt="Preview" style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }} />
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control type="url" name="website" value={formData.website} onChange={handleInputChange} />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">{editingBrand ? 'Update' : 'Create'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, brand: null })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{deleteModal.brand?.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, brand: null })}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Brands;
