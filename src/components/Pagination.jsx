function Pagination({ products, pageInfo, getProduct }) {
  const handlePageChange = (page) => {
    getProduct(page);
  };

  return (
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

            {Array.from({ length: pageInfo.total_pages }).map((item, index) => (
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
            ))}

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
  );
}

export default Pagination;
