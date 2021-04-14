(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{414:function(n,t,a){"use strict";a.r(t);var o=a(59),e=Object(o.a)({},(function(){var n=this.$createElement,t=this._self._c||n;return t("ContentSlotsDistributor",{attrs:{"slot-key":this.$parent.slotKey}},[t("h1",{attrs:{id:"bar-chart"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#bar-chart"}},[this._v("#")]),this._v(" Bar Chart")]),this._v(" "),t("chart-editor",{attrs:{code:"// <block:setup:5>\nconst DATA_COUNT = 8;\nconst MIN = 10;\nconst MAX = 100;\n\nUtils.srand(8);\n\nconst labels = [];\nfor (let i = 0; i < DATA_COUNT; ++i) {\n  labels.push('Label ' + i);\n}\n\nconst numberCfg = {count: DATA_COUNT, min: MIN, max: MAX};\n\nconst data = {\n  labels: labels,\n  datasets: [{\n    data: Utils.numbers(numberCfg),\n  }, {\n    data: Utils.numbers(numberCfg),\n  }, {\n    data: Utils.numbers(numberCfg),\n  }]\n};\n// </block:setup>\n\n// <block:annotation1:1>\nconst annotation1 = {\n  type: 'line',\n  scaleID: 'x',\n  borderWidth: 3,\n  borderColor: 'black',\n  value: 0.5,\n  label: {\n    content: 'Line annotation at x=0.5',\n    enabled: true\n  },\n};\n// </block:annotation1>\n\n// <block:annotation2:2>\nconst annotation2 = {\n  type: 'line',\n  scaleID: 'x',\n  borderWidth: 3,\n  borderColor: 'black',\n  value: 'Label 5',\n  label: {\n    rotation: 'auto',\n    position: 'start',\n    backgroundColor: 'black',\n    content: 'Line at x=Label 5',\n    enabled: true\n  }\n};\n// </block:annotation2>\n\n// <block:annotation3:3>\nconst annotation3 = {\n  type: 'box',\n  xMin: 2.5,\n  xMax: 3.5,\n  yMin: 0,\n  yMax: 100,\n  backgroundColor: 'rgba(250,250,0,0.4)',\n  borderColor: 'rgba(0,150,0,0.2)',\n  drawTime: 'beforeDatasetsDraw',\n  borderWidth: 0,\n  cornerRadius: 0,\n};\n// </block:annotation3>\n\n\n/* <block:config:0> */\nconst config = {\n  type: 'bar',\n  data,\n  options: {\n    plugins: {\n      annotation: {\n        annotations: {\n          annotation1,\n          annotation2,\n          annotation3\n        }\n      }\n    },\n  }\n};\n/* </block:config> */\n\n// <block:utils:4>\nfunction minValue(ctx) {\n  const dataset = ctx.chart.data.datasets[0];\n  return dataset.data.reduce((max, point) => Math.min(point, max), Infinity);\n}\n\nfunction maxValue(ctx) {\n  const datasets = ctx.chart.data.datasets;\n  const count = datasets[0].data.length;\n  let max = 0;\n  for (let i = 0; i < count; i++) {\n    let sum = 0;\n    for (const dataset of datasets) {\n      sum += dataset.data[i];\n    }\n    max = Math.max(max, sum);\n  }\n  return max;\n}\n// </block:utils>\n\nvar actions = [\n  {\n    name: 'Randomize',\n    handler: function(chart) {\n      chart.data.datasets.forEach(function(dataset, i) {\n        dataset.data = dataset.data.map(() => Utils.rand(MIN, MAX));\n      });\n\n      chart.update();\n    }\n  },\n  {\n    name: 'Add data',\n    handler: function(chart) {\n      chart.data.labels.push('Label ' + chart.data.labels.length);\n      chart.data.datasets.forEach(function(dataset, i) {\n        dataset.data.push(Utils.rand(MIN, MAX));\n      });\n\n      chart.update();\n    }\n  },\n  {\n    name: 'Remove data',\n    handler: function(chart) {\n      chart.data.labels.shift();\n      chart.data.datasets.forEach(function(dataset, i) {\n        dataset.data.shift();\n      });\n\n      chart.update();\n    }\n  }\n];\n\nmodule.exports = {\n  actions: actions,\n  config: config,\n};\n"}})],1)}),[],!1,null,null,null);t.default=e.exports}}]);