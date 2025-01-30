import { useEffect, useRef, useState } from 'react'
// import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import axios from 'axios';
import { Modal } from 'bootstrap';
import LoginPage from "./pages/LoginPage"
// import ProductPage from './pages/ProductPage';
// import './App.css'

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""]
};

function App() {

  const [isAuth, setIsAuth] = useState(false);

  const [products, setProduct] = useState([]);


  const getProduct = async (page) => {
    try{
      const res =await axios.get(`${BASE_URL}/v2/api/${API_PATH}/admin/products?page=${page}`)
      setProduct(res.data.products)
      setPageInfo(res.data.pagination)
    } catch (err) {
      console.log(err)
    }
  };

  const checkUser = async () =>{
    try{
      await axios.post(`${BASE_URL}/v2/api/user/check`);
      getProduct();
      setIsAuth(true);
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(() =>{
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1",
    );

    axios.defaults.headers.common['Authorization'] = token;

    checkUser();
  }, []);

  const productModalRef =  useRef(null);
  const delProductModalRef = useRef(null);
  const [modalMode, setModalMode] = useState(null);
  const [tempProduct, setTempProduct] = useState(defaultModalState);

  useEffect(() => {
    new Modal(productModalRef.current, {
      backdrop: false
    });

    new Modal(delProductModalRef.current, {
      backdrop: false
    });

  }, []);

  const handleFileChange =async (e) =>{
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file-to-upload", file)

    
    try {
      const res = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/upload`, formData);
      const uploadedImageUrl = res.data.imageUrl;

      setTempProduct({
        ...tempProduct,
        imageUrl: uploadedImageUrl
      })
    } catch (error) {
      alert(`上傳失敗`);
    }

  };

  const handleOpenModal = (mode, product) => {
    setModalMode(mode);

    switch (mode) {
      case "create":
      setTempProduct(defaultModalState);
      break;

      case "edit":
      setTempProduct(product);
      break;
    }

    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  };

  const handleCloseModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
  };

  const handleOpenDelModal = (product) => {
    setTempProduct(product);
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.show();
  };

  const handleCloseDelModal = () => {
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.hide();
  };


  const handleInputChange = (e) =>{
    const { value, name, checked, type } = e.target;
    setTempProduct({
      ...tempProduct,
      [name]: type === "checkbox" ?  checked: value
    })
  };

  const handleImageChange = (e, index) =>{
    const { value } = e.target;

    const newImages = [...tempProduct.imagesUrl];

    newImages[index] = value;

    setTempProduct({
      ...tempProduct,
      imagesUrl:newImages
    })
  };

  const handleAddImage = () =>{
    const newImages = [...tempProduct.imagesUrl, ""];

    setTempProduct({
      ...tempProduct,
      imagesUrl:newImages
    })
  };

  const handleRemoveImage = () =>{
    const newImages = [...tempProduct.imagesUrl];

    newImages.pop();

    setTempProduct({
      ...tempProduct,
      imagesUrl:newImages
    })
  };

  const createProduct = async () => {
    try {
      await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/product`,{
        data:{
          ...tempProduct,
          origin_price:Number(tempProduct.origin_price),
          price:Number(tempProduct.price),
          is_enabled:tempProduct.is_enabled ? 1 : 0
        }
      }
      )
    } catch (error) {
      alert(`新增產品失敗`);
    }
  }

  const updataProduct = async () => {
    try {
      await axios.put(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`,{
        data:{
          ...tempProduct,
          origin_price:Number(tempProduct.origin_price),
          price:Number(tempProduct.price),
          is_enabled:tempProduct.is_enabled ? 1 : 0
        }
      }
      )
    } catch (error) {
      alert(`新增產品失敗`);
    }
  }

  const deleteProduct = async () => {
    try {
      await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`)
    } catch (error) {
      alert(`刪除產品失敗`);
    }
  }

  const handleUpdateProduct = async () => {
    const apiCall = modalMode === "create" ? createProduct : updataProduct;

    try {
      await apiCall();

      getProduct();

      handleCloseModal();
    } catch (error) {
      alert(`更新產品失敗`);
    }
  }

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct();
      getProduct();
      handleCloseDelModal();
    } catch (error) {
      alert(`刪除產品失敗`);
    }

  };

  const [pageInfo, setPageInfo] = useState({});

  const handlePageChange = (page) => {
    getProduct(page);
  };

  return (
    <>
      {isAuth ? (<div className="container py-5">
                  <div className="row">
                    <div className="col">
                      <div className='d-flex justify-content-between'>
                      <h2>產品列表</h2>
                      <button onClick={() =>{
                        handleOpenModal("create")
                      }} type="button" className="btn btn-primary">建立新的產品</button>
                      </div>
                      <table className="table">
                        <thead>
                          <tr>
                            <th scope="col">產品名稱</th>
                            <th scope="col">原價</th>
                            <th scope="col">售價</th>
                            <th scope="col">是否啟用</th>
                            <th scope="col">查看細節</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr key={product.id}>
                              <th scope="row">{product.title}</th>
                              <td>{product.origin_price}</td>
                              <td>{product.price}</td>
                              <td>{product.is_enabled ? (<span className="text-success">啟用</span>):<span>未啟用</span>}</td>
                              <td>
                                <div className="btn-group">
                                  <button onClick={() =>{
                                    handleOpenModal("edit",product)
                                  }} type="button" className="btn btn-outline-primary btn-sm">編輯</button>
                                  <button onClick={() => {handleOpenDelModal(product)}} type="button" className="btn btn-outline-danger btn-sm">刪除</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-center">
          {products.length < 1 ? (
            ""
          ) : (
            <nav>
              <ul className="pagination">
                <li className={`page-item ${!pageInfo.has_pre && "disabled"}`}>
                  <a
                    onClick={() => handlePageChange(pageInfo.current_page - 1)}
                    className="page-link"
                    href="#"
                  >
                    上一頁
                  </a>
                </li>

                {Array.from({ length: pageInfo.total_pages }).map(
                  (item, index) => (
                    <li
                      key={index}
                      className={`page-item ${
                        pageInfo.current_page === index + 1 && "active"
                      }`}
                    >
                      <a
                        onClick={() => handlePageChange(index + 1)}
                        className="page-link"
                        href="#"
                      >
                        {index + 1}
                      </a>
                    </li>
                  )
                )}

                <li className={`page-item ${!pageInfo.has_next && "disabled"}`}>
                  <a
                    onClick={() => handlePageChange(pageInfo.current_page + 1)}
                    className="page-link"
                    href="#"
                  >
                    下一頁
                  </a>
                </li>
              </ul>
            </nav>
          )}
        </div>
                </div>) : <LoginPage getProduct={getProduct}/>}
  
                <div ref={productModalRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">{modalMode === "create" ? "新增產品" : "編輯產品"}</h5>
              <button onClick={handleCloseModal} type="button" className="btn-close" aria-label="Close"></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">

                <div className="mb-5">
                    <label htmlFor="fileInput" className="form-label">
                      {" "}
                      圖片上傳{" "}
                    </label>
                    <input
                      onChange={handleFileChange}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="form-control"
                      id="fileInput"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                        value={tempProduct.imageUrl}
                        onChange={handleInputChange}
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>
                    <img
                      src={tempProduct.imageUrl}
                      alt={tempProduct.title}
                      className="img-fluid"
                    />
                  </div>

                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          value={image}
                          onChange={(e) => handleImageChange(e, index)}
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}

                      <div className="btn-group w-100">
                        {tempProduct.imagesUrl.length < 5 && tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1] !== "" && (<button onClick={handleAddImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>)}

                        {tempProduct.imagesUrl.length > 1 && (<button onClick={handleRemoveImage} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>)}
                      </div>

                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      value={tempProduct.title}
                      onChange={handleInputChange}
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      value={tempProduct.category}
                      onChange={handleInputChange}
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      value={tempProduct.unit}
                      onChange={handleInputChange}
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        value={tempProduct.origin_price}
                        onChange={handleInputChange}
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        value={tempProduct.price}
                        onChange={handleInputChange}
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      value={tempProduct.description}
                      onChange={handleInputChange}
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      value={tempProduct.content}
                      onChange={handleInputChange}
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      checked={tempProduct.is_enabled}
                      onChange={handleInputChange}
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button onClick={handleCloseModal} type="button" className="btn btn-secondary">
                取消
              </button>
              <button onClick={handleUpdateProduct} type="button" className="btn btn-primary">
                確認
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={delProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                onClick={handleCloseDelModal}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除 
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleCloseDelModal}
                type="button"
                className="btn btn-secondary"
              >
                取消
              </button>
              <button onClick={handleDeleteProduct} type="button" className="btn btn-danger">
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
