// import { SolidApexCharts } from "solid-apexcharts";

import Chart from "react-apexcharts";
// import { createSignal, createEffect, Component } from "solid-js";
import { useEffect, useState } from "react";
import { ERC20Txn } from "../../schema/supabase-types";

import styles from "./Chart.module.css";

function ApexChart(props) {
  const [chartProps, setChartProps] = useState<{
    series: any;
    options: any;
  }>({
    series: {
      list: [
        {
          name: "balance",
          data: [],
        },
      ],
    },
    options: {
      chart: {
        id: "solidchart-example",
      },
      xaxis: {
        type: "datetime",
      },
    },
  });

  useEffect(() => {
    const { chartData } = props;

    setChartProps({
      options: {
        chart: {
          id: "solidchart-example",
        },
        xaxis: {
          categories: chartData?.map((txn: ERC20Txn) => txn.token_address),
        },
      },
      series: {
        list: [
          {
            name: "balance",
            data: chartData?.map((txn: ERC20Txn) => txn.balance),
          },
        ],
      },
    });
  });

  return (
    <div className={styles["chart-wrapper"]}>
      <span>Balance</span>
      <Chart
        width={650}
        type="bar"
        options={chartProps.options}
        series={chartProps.series.list}
      />
    </div>
  );
}

export default ApexChart;
