// import Button from "../Button/Button";
// import { createSignal, createEffect, For, Show } from "solid-js";
// import { useNavigate, useLocation } from "@solidjs/router";
// // @ts-expect-error
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "../Select/Select";
import styles from "./Menu.module.css";
import { render } from "react-dom";
import Button from "../Button/Button";
// import Select from "../Select/Select";
////////

const ledgersPaths = {
  eth: [
    { title: "DASHBOARD", path: "/eth" },
    { title: "ERC20", path: "/eth/accounts/erc20" },
    { title: "NFT ERC721", path: "/eth/accounts/erc721" },
  ],
  fabric: [{ title: "DASHBOARD", path: "/fabric" }],
};

function Menu() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeLedger, setActiveLedger] = useState("");
  const handleSelect = (selectedValue: string) => {
    setActiveLedger(selectedValue);
    navigate(`/${activeLedger}`);
  };

  useEffect(() => {
    if (activeLedger.length > 0) return;
    const currentPath = location.pathname;
    const ledgers = ["eth", "fabric"];

    ledgers.forEach((ledger) => {
      if (currentPath.includes(ledger)) {
        setActiveLedger(ledger);
      }
    });
  });

  function activeLedgerItems(ledger: any) {
    const items = ledger.map(function (path: any) {
      return (
        <Button onClick={() => navigate(path.path)} type="menu">
          {path.title}
        </Button>
      );
    });

    return items;
  }

  return (
    <div className={styles["nav-bar"]}>
      <Select
        value={activeLedger}
        onSelect={(val: string) => {
          handleSelect(val);
        }}
      />

      {activeLedger.length > 0 ? (
        <nav className={styles.navigation}>
          {activeLedgerItems(ledgersPaths[activeLedger])}
        </nav>
      ) : null}
    </div>
  );
}

export default Menu;
