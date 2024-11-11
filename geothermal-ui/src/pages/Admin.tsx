import { AdminForm } from "../components/AdminForm/AdminForm";
import { AdminTitle } from "../components/AdminTitle/AdminTitle";

export function Admin() {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.leftContainer}>
        <AdminTitle />
      </div>
      <div style={styles.rightContainer}>
        <AdminForm />
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100vw",
    margin: "0 auto",
    padding: "20px 40px",
  },
  leftContainer: {
    flex: 1,
    paddingTop: "50px",
    paddingRight: "40px",
    minWidth: "300px",
  },
  rightContainer: {
    flex: 1.7,
    paddingLeft: "40px",
    minWidth: "500px",
    borderLeft: "1px solid #ccc",
  },
};
