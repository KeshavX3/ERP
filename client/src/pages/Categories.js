import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import ImageWithFallback from '../components/ImageWithFallback';

const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, category: null });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [pendingNavigationFilter, setPendingNavigationFilter] = useState(null);

  useEffect(() => {
    loadCategories();
    loadCategoryCounts();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories({ limit: 100 });
      setCategories(response.categories);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryCounts = async () => {
    try {
      const categories = await categoryService.getCategories({ limit: 100 });
      const counts = {};
      
      for (const category of categories.categories) {
        try {
          const products = await productService.getProducts({ 
            category: category._id,
            limit: 1 
          });
          counts[category._id] = products.total || 0;
        } catch (error) {
          counts[category._id] = 0;
        }
      }
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Failed to load category counts:', error);
    }
  };

  const handleCategoryClick = (category, e) => {
    // If clicking on action buttons, don't navigate
    if (e.target.closest('.action-buttons')) {
      return;
    }
    
    // Navigate to products page with category filter
    navigate('/products', { 
      state: { 
        categoryFilter: category._id,
        categoryName: category.name 
      } 
    });
  };

  const handleAdd = () => {
    setFormData({ name: '', description: '', image: '' });
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    });
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = (category) => {
    setDeleteModal({ show: true, category });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory(formData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      loadCategories();
      loadCategoryCounts();
    } catch (error) {
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
    }
  };

  const confirmDelete = async () => {
    try {
      await categoryService.deleteCategory(deleteModal.category._id);
      toast.success('Category deleted successfully');
      setDeleteModal({ show: false, category: null });
      loadCategories();
      loadCategoryCounts();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle navigation state from Brands/Products pages (cross-page navigation)
  useEffect(() => {
    if (location.state) {
      const { categoryFilter, categoryName } = location.state;
      let newFilters = {};
      if (categoryFilter) {
        newFilters.category = categoryFilter;
        toast.info(`Showing products from category: ${categoryName}`);
      }
      if (Object.keys(newFilters).length > 0) {
        setPendingNavigationFilter(newFilters);
      } else {
        navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    if (pendingNavigationFilter) {
      // If you want to filter categories here, apply the filter logic
      // For now, just clear navigation state after showing toast
      setPendingNavigationFilter(null);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [pendingNavigationFilter, navigate, location.pathname]);

  return (
    <div className="main-content">
      <Container fluid className="px-4">
        {/* Header Section */}
        <div className="header">
          <Row className="align-items-center">
            <Col>
              <h1 className="mb-0">Categories</h1>
              <p className="text-muted mb-0">Manage your product categories</p>
            </Col>
            <Col xs="auto">
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
                  <i className="fas fa-plus me-2"></i>Add Category
                </Button>
              </div>
            </Col>
          </Row>
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
              <Row>
                {categories.map(category => (
                  <Col lg={3} md={4} sm={6} xs={12} key={category._id} className="mb-4">
                    <Card 
                      className="category-card h-100 shadow-sm" 
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => handleCategoryClick(category, e)}
                    >
                      <div className="category-image-container">
                        <ImageWithFallback
                          src={category.image}
                          alt={category.name}
                          className="category-image"
                          fallbackSrc="/api/placeholder/300/200"
                        />
                        <div className="category-overlay">
                          <Badge bg="primary" className="product-count-badge">
                            {categoryCounts[category._id] || 0} Products
                          </Badge>
                        </div>
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <div className="flex-grow-1">
                          <h5 className="category-title">{category.name}</h5>
                          <p className="category-description text-muted">
                            {category.description || 'No description available'}
                          </p>
                        </div>
                        <div className="category-footer">
                          <small className="text-muted">
                            Created: {new Date(category.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="action-buttons mt-2">
                          <Button
                            variant="warning"
                            size="sm"
                            className="me-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(category);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(category);
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Card className="shadow-sm">
                <Card.Body>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Description</th>
                          <th>Products</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(category => (
                          <tr 
                            key={category._id} 
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => handleCategoryClick(category, e)}
                          >
                            <td>
                              <ImageWithFallback
                                src={category.image}
                                alt={category.name}
                                className="table-image"
                                fallbackSrc="/api/placeholder/60/60"
                              />
                            </td>
                            <td><strong>{category.name}</strong></td>
                            <td>{category.description || 'No description'}</td>
                            <td>
                              <Badge bg="primary">
                                {categoryCounts[category._id] || 0} Products
                              </Badge>
                            </td>
                            <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                            <td>
                              <div className="action-buttons d-flex gap-2">
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(category);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(category);
                                  }}
                                >
                                  Delete
                                </Button>
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
            <Modal.Title>{editingCategory ? 'Edit Category' : 'Add Category'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                />
                {formData.image && (
                  <div className="mt-2">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, category: null })}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete "{deleteModal.category?.name}"?
            This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ show: false, category: null })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Categories;
