import '@klinecharts/pro/dist/klinecharts-pro.css'
import {Layout, Model} from 'flexlayout-react';
import './App.css'
import 'flexlayout-react/style/light.css';

import Chart from "./components/Chart.tsx";
import CoinrayScriptEditor from "./components/CoinrayScriptEditor.tsx";
// import type { Point } from 'klinecharts'


const layout = {
  global: {
    rootOrientationVertical: true
  },
  borders: [

  ],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 70,
        children: [
          {
            type: "tab",
            name: "Chart",
            component: "chart",
          }
        ]
      },
      {
        type: "tabset",
        weight: 30,
        children: [
          {
            type: "tab",
            name: "Coinray Script",
            component: "coinrayScriptEditor",
          }
        ]
      },
    ]
  }
};
const model = Model.fromJson(layout);

const defaultScript = `indicator("Simple Moving Average example", #{ overlay: true });

let fastLength   = input(10,  "Fast Average Length");
let slowLength   = input(30,  "Slow Average Length");
let show         = input(true,  "Show me");

const fastColors = palette(#{orange: color.orange, teal: color.teal});
const slowColors = palette(#{orange: color.orange, teal: color.teal});

let averageData  = close;

let fastAverage  = ta::sma(averageData, fastLength);
let slowAverage  = ta::sma(averageData, slowLength);

plot(fastAverage, #{ color: fastColors.orange, title: "Fast SMA" });
plot(slowAverage, #{ color: slowColors.teal,   title: "Slow SMA" });
`


function App() {
  const factory = (node) => {
    const component = node.getComponent();

    switch (component) {
      case "coinrayScriptEditor":
        return <CoinrayScriptEditor value={defaultScript} onChange={function(code: string): void {
            console.log(code)
        } }/>;
      case "chart":
        return <Chart/>;
      default:
        return <div className="placeholder">No Widget</div>;

    }
  }

  return <Layout model={model}
                 factory={factory}/>
}

export default App
