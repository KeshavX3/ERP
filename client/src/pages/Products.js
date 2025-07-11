import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Modal, Form, Pagination, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import brandService from '../services/brandService';
import ProductModal from '../components/ProductModal';
import ProductForm from '../components/ProductForm';
import ImageWithFallback from '../components/ImageWithFallback';
import { useCart } from '../context/CartContext';

const Products = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, product: null });
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, limit: 12 });
  const [filters, setFilters] = useState({
    search: '', category: '', brand: '', priceRange: '', minPrice: '', maxPrice: '', page: 1
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  
  const priceRanges = [
    { value: '', label: 'All Prices' },
    { value: '0-300', label: '$0 - $300' },
    { value: '300-1000', label: '$300 - $1,000' },
    { value: '1000-5000', label: '$1,000 - $5,000' },
    { value: '5000-above', label: '$5,000 & Above' }
  ];
  useEffect(() => {
    let shouldUpdateFilters = false;
    let newFilters = { ...filters };

    // Handle navigation state from Categories/Brands pages (priority)
    if (location.state) {
      const { categoryFilter, brandFilter, categoryName, brandName } = location.state;
      if (categoryFilter) {
        newFilters.category = categoryFilter;
        newFilters.page = 1;
        shouldUpdateFilters = true;
        toast.info(`Showing products from category: ${categoryName}`);
      }
      if (brandFilter) {
        newFilters.brand = brandFilter;
        newFilters.page = 1;
        shouldUpdateFilters = true;
        toast.info(`Showing products from brand: ${brandName}`);
      }
      
      // Clear navigation state immediately
      navigate(location.pathname, { replace: true, state: null });
    } else {
      // Handle URL parameters if no navigation state
      const urlParams = new URLSearchParams(location.search);
      const categoryParam = urlParams.get('category');
      const brandParam = urlParams.get('brand');
      
      if (categoryParam && categoryParam !== filters.category) {
        newFilters.category = categoryParam;
        shouldUpdateFilters = true;
      }
      if (brandParam && brandParam !== filters.brand) {
        newFilters.brand = brandParam;
        shouldUpdateFilters = true;
      }
    }

    if (shouldUpdateFilters) {
      setFilters(newFilters);
    }
  }, [location.state, location.search, location.pathname, navigate]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Process price range filter
      let processedFilters = { ...filters };
      console.log('DEBUG: Filters sent to backend:', processedFilters);
      
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-');
        if (max === 'above') {
          processedFilters.minPrice = min;
          processedFilters.maxPrice = '';
        } else {
          processedFilters.minPrice = min;
          processedFilters.maxPrice = max;
        }
      }
      
      const response = await productService.getProducts(processedFilters);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
  }, [filters, loadProducts]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories({ limit: 100 });
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await brandService.getBrands({ limit: 100 });
      setBrands(response.brands);
    } catch (error) {
      console.error('Failed to load brands:', error);
    }
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setShowFormModal(true);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleProductClick = (product, e) => {
    // Prevent opening modal if clicking on action buttons
    if (e.target.closest('.product-actions')) {
      return;
    }
    handleView(product);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowFormModal(true);
  };

  const handleDelete = (product) => {
    setDeleteModal({ show: true, product });
  };

  const confirmDelete = async () => {
    try {
      await productService.deleteProduct(deleteModal.product._id);
      toast.success('Product deleted successfully');
      setDeleteModal({ show: false, product: null });
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct(formData);
        toast.success('Product created successfully');
      }
      setShowFormModal(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filtering
    });
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      priceRange: '',
      minPrice: '',
      maxPrice: '',
      page: 1
    });
    // Clear URL parameters
    navigate('/products', { replace: true });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  const calculateDiscountPrice = (price, discount) => {
    if (!price) return 0;
    if (!discount || discount <= 0) return price;
    return price - (price * (discount / 100));
  };

  const getDisplayPrice = (product) => {
    const originalPrice = product.price || 0;
    const discount = product.discount || 0;
    
    // Use backend calculated discountPrice if available, otherwise calculate it
    if (product.discountPrice !== undefined && product.discountPrice !== null) {
      return product.discountPrice;
    }
    
    return calculateDiscountPrice(originalPrice, discount);
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.category ||
      filters.brand ||
      filters.priceRange ||
      filters.minPrice ||
      filters.maxPrice
    );
  };

  return (
    <>
      <div className="fade-in">
        <div className="modern-page-header">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">Manage your product inventory with style</p>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <i className="fas fa-th me-1"></i>Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <i className="fas fa-list me-1"></i>Table
            </Button>
            <Button variant="primary" onClick={handleAdd}>
              <i className="fas fa-plus me-2"></i>Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="filter-section shadow-sm mb-4">
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <Row className="g-3">
              <Col xl={3} lg={3} md={4} sm={6} xs={12}>
                <div className="filter-group">
                  <label className="filter-label">Search Products</label>
                  <div className="search-box">
                    <i className="fas fa-search search-icon"></i>
                    <Form.Control
                      type="text"
                      placeholder="Search by name or description..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
              </Col>
              <Col xl={2} lg={2} md={3} sm={6} xs={12}>
                <div className="filter-group">
                  <label className="filter-label">Category</label>
                  <Form.Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Col>
              <Col xl={2} lg={2} md={3} sm={6} xs={12}>
                <div className="filter-group">
                  <label className="filter-label">Brand</label>
                  <Form.Select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Col>
              <Col xl={2} lg={2} md={3} sm={6} xs={12}>
                <div className="filter-group">
                  <label className="filter-label">Price Range</label>
                  <Form.Select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="filter-select"
                  >
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Col>
              <Col xl={2} lg={2} md={3} sm={6} xs={12}>
                <div className="filter-group">
                  <label className="filter-label">Items per page</label>
                  <Form.Select
                    value={pagination.limit}
                    onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    className="filter-select"
                  >
                    <option value={12}>12 items</option>
                    <option value={24}>24 items</option>
                    <option value={48}>48 items</option>
                  </Form.Select>
                </div>
              </Col>
              <Col xl={1} lg={1} md={2} sm={6} xs={12}>
                <div className="filter-group">
                  <label className="filter-label">&nbsp;</label>
                  <Button
                    variant="outline-secondary"
                    onClick={clearAllFilters}
                    className="clear-filters-btn w-100"
                    title="Clear all filters"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              </Col>
            </Row>
            
            {/* Active Filters Display */}
            {hasActiveFilters() && (
              <div className="active-filters-section mb-3">
                <div className="d-flex flex-wrap align-items-center">
                  <span className="me-2">Active filters:</span>
                  <div className="filter-tags">
                    {filters.search && (
                      <span className="filter-tag">
                        Search: "{filters.search}"
                        <button onClick={() => handleFilterChange('search', '')}>×</button>
                      </span>
                    )}
                    {filters.category && (
                      <span className="filter-tag">
                        Category: {categories.find(c => c._id === filters.category)?.name}
                        <button onClick={() => handleFilterChange('category', '')}>×</button>
                      </span>
                    )}
                    {filters.brand && (
                      <span className="filter-tag">
                        Brand: {brands.find(b => b._id === filters.brand)?.name}
                        <button onClick={() => handleFilterChange('brand', '')}>×</button>
                      </span>
                    )}
                    {filters.priceRange && (
                      <span className="filter-tag">
                        Price: {priceRanges.find(p => p.value === filters.priceRange)?.label}
                        <button onClick={() => handleFilterChange('priceRange', '')}>×</button>
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="ms-auto"
                    onClick={clearAllFilters}
                  >
                    <i className="fas fa-times me-1"></i>
                    Clear all
                  </Button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Products Content */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state text-center py-5">
            <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
            <h4>No products found</h4>
            <p className="text-muted">Try adjusting your filters or add some products.</p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="results-summary mb-3">
              <span>
                Showing {products.length} of {pagination.total} products
              </span>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="products-grid">
                {products.map(product => (
                  <div
                    key={product._id}
                    className="product-card-wrapper"
                    onClick={(e) => handleProductClick(product, e)}
                  >
                    <Card className="product-card h-100">
                      <div className="product-image-container">
                        <ImageWithFallback
                          src={product.image ? `http://localhost:5000${product.image}` : null}
                          alt={product.name}
                          className="product-image"
                        />
                        <div className="product-actions">
                          <Button
                            variant="light"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(product);
                            }}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="light"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product);
                            }}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                      <Card.Body className="product-info">
                        <div className="product-category">
                          {product.category?.name}
                        </div>
                        <h5 className="product-title">{product.name}</h5>
                        <p className="product-description">
                          {product.description?.substring(0, 80)}...
                        </p>
                        <div className="product-brand">
                          <i className="fas fa-tag"></i>
                          {product.brand?.name}
                        </div>
                        <div className="product-price-section text-center mt-2">
                          {product.discount > 0 ? (
                            <>
                              <div className="d-flex justify-content-center align-items-center mb-1">
                                <span className="original-price me-2" style={{ color: '#888', textDecoration: 'line-through', fontSize: '1rem' }}>
                                  {formatPrice(product.price)}
                                </span>
                                <span className="discount-badge ms-1" style={{ fontWeight: 700, fontSize: '0.95rem', background: '#e74c3c', color: '#fff', borderRadius: '4px', padding: '2px 8px', marginLeft: '8px' }}>
                                  {product.discount}% OFF
                                </span>
                              </div>
                              <div className="current-price mb-2" style={{ color: '#27ae60', fontWeight: 700, fontSize: '1.3rem' }}>
                                {formatPrice(getDisplayPrice(product))}
                              </div>
                            </>
                          ) : (
                            <div className="current-price mb-2" style={{ color: '#27ae60', fontWeight: 700, fontSize: '1.3rem' }}>
                              {formatPrice(product.price)}
                            </div>
                          )}
                          <Button
                            variant={isInCart(product._id) ? "success" : "primary"}
                            size="sm"
                            className="w-100 add-to-cart-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                          >
                            {isInCart(product._id) ? (
                              <>
                                <i className="fas fa-check me-1"></i>
                                In Cart ({getItemQuantity(product._id)})
                              </>
                            ) : (
                              <>
                                <i className="fas fa-cart-plus me-1"></i>
                                Add to Cart
                              </>
                            )}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <Card className="table-card">
                <Card.Body className="p-0">
                  <Table responsive hover className="products-table mb-0">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Price</th>
                        <th>Actions</th>
                        <th>Cart</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr
                          key={product._id}
                          className="product-row"
                          onClick={(e) => handleProductClick(product, e)}
                        >
                          <td>
                            <ImageWithFallback
                              src={product.image ? `http://localhost:5000${product.image}` : null}
                              alt={product.name}
                              className="table-image"
                            />
                          </td>
                          <td>{product.name}</td>
                          <td>{product.category?.name}</td>
                          <td>{product.brand?.name}</td>
                          <td>{formatPrice(getDisplayPrice(product))}</td>
                          <td>
                            <div className="product-actions">
                              <Button
                                variant="light"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(product);
                                }}
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button
                                variant="light"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(product);
                                }}
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                          </td>
                          <td>
                            <Button
                              variant={isInCart(product._id) ? "success" : "primary"}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                            >
                              {isInCart(product._id) ? (
                                <>
                                  <i className="fas fa-check me-1"></i>
                                  In Cart ({getItemQuantity(product._id)})
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-cart-plus me-1"></i>
                                  Add to Cart
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination-container d-flex justify-content-center mt-4 mb-4">
                <Pagination>
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.current === 1}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                  />
                  
                  {[...Array(pagination.pages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= pagination.current - 2 && page <= pagination.current + 2)
                    ) {
                      return (
                        <Pagination.Item
                          key={page}
                          active={page === pagination.current}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    } else if (
                      page === pagination.current - 3 ||
                      page === pagination.current + 3
                    ) {
                      return <Pagination.Ellipsis key={page} />;
                    }
                    return null;
                  })}
                  
                  <Pagination.Next
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.pages}
                  />
                  <Pagination.Last
                    onClick={() => handlePageChange(pagination.pages)}
                    disabled={pagination.current === pagination.pages}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </div> {/* Close page-content wrapper */}

        {/* Modals */}
        <ProductModal
          show={showModal}
          onHide={() => setShowModal(false)}
          product={selectedProduct}
        />

        <Modal show={showFormModal} onHide={() => setShowFormModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProductForm
              product={editingProduct}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowFormModal(false)}
            />
          </Modal.Body>
        </Modal>

        <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, product: null })}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete "{deleteModal.product?.name}"?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDeleteModal({ show: false, product: null })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default Products;
