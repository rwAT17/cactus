// @ts-expect-error
import { TbCactus } from "solid-icons/tb";
import styles from "./Home.module.css";

const Home = () => {
  return (
    <div class={styles.home}>
      <p>Select ledger from the dropdown menu</p>
      <span class={styles["home-icon"]}>
        <TbCactus />
      </span>
    </div>
  );
};

export default Home;
