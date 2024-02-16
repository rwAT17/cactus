// import { BiRegularWallet } from "solid-icons/bi";
// import { Component } from "solid-js";
// @ts-expect-error
import styles from "./TokenHeader.module.css";

function TokenAccount(props) {
  return (
    <div className={styles["token-account"]}>
      <span>
        {" "}
        <span className={styles["token-account-icon"]}>
          {/* <BiRegularWallet /> */}
        </span>{" "}
        {props.accountNum}
      </span>
    </div>
  );
}

export default TokenAccount;
