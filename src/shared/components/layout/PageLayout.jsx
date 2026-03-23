import Topbar from "./Topbar";

const PageLayout = ({ children }) => {
  return (
    <div className="page-layout">
      <Topbar />
      <main className="page-content">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;