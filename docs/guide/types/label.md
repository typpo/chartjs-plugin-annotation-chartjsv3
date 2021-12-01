# Label Annotations

Label annotations are used to add contents on the chart area. This can be useful for describing values that are of interest.

```js chart-editor
/* <block:options:0> */
const options = {
  plugins: {
    autocolors: false,
    annotation: {
      annotations: {
        label1: {
          type: 'label',
          xValue: 2.5,
          yValue: 60,
          backgroundColor: 'rgba(245,245,245)',
          content: ['This is my text', 'This is my text, second line'],
          font: {
            size: 18
          }
        }
      }
    }
  }
};
/* </block:options> */

/* <block:config:1> */
const config = {
  type: 'line',
  data: {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: 'My First Dataset',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  },
  options
};
/* </block:config> */

module.exports = {
  config
};
```

## Configuration

The following options are available for label annotations.

| Name | Type | [Scriptable](../options#scriptable-options) | Default
| ---- | ---- | :----: | ----
| [`adjustScaleRange`](#general) | `boolean` | Yes | `true`
| [`backgroundColor`](#styling) | [`Color`](../options#color) | Yes | `transparent`
| [`borderCapStyle`](#styling) | `string` | Yes | `'butt'`
| [`borderColor`](#styling) | [`Color`](../options#color) | Yes | `options.color`
| [`borderDash`](#styling) | `number[]` | Yes | `[]`
| [`borderDashOffset`](#styling) | `number` | Yes | `0`
| [`borderJoinStyle`](#styling) | `string` | Yes | `'miter'`
| [`borderRadius`](#borderradius) | `number` \| `object` | Yes | `0`
| [`borderWidth`](#styling) | `number`| Yes | `0`
| [`color`](#styling) | [`Color`](../options#color) | Yes | `'black'`
| [`content`](#general) | `string`\|`string[]`\|[`Image`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image) | Yes | `null`
| [`display`](#general) | `boolean` | Yes | `true`
| [`drawTime`](#general) | `string` | Yes | `'afterDatasetsDraw'`
| [`font`](#styling) | [`Font`](../options#font) | Yes | `{}`
| [`height`](#general) | `number`\|`string` | Yes | `undefined` 
| [`padding`](#general) | [`Padding`](../options#padding) | Yes | `6`
| [`position`](#position) | `string`\|`{x: string, y: string}` | Yes | `'center'`
| [`textAlign`](#general) | `string` | Yes | `'center'`
| [`width`](#general) | `number`\|`string` | Yes | `undefined`
| [`xAdjust`](#general) | `number` | Yes | `0`
| [`xScaleID`](#general) | `string` | Yes | `'x'`
| [`xValue`](#general) | `number` \| `string` | Yes | `undefined`
| [`yAdjust`](#general) | `number` | Yes | `0`
| [`yScaleID`](#general) | `string` | Yes | `'y'`
| [`yValue`](#general) | `number` \| `string` | Yes | `undefined`

### General

If one of the axes does not match an axis in the chart, the content will be rendered in the center of the chart. The 2 coordinates, xValue, yValue are optional. If not specified, the content will be rendered in the center of the chart.

| Name | Description |
| ---- | ---- |
| `adjustScaleRange` | Should the scale range be adjusted if this annotation is out of range
| `content` | The content to show in the text annotation.
| `display` | Whether or not this annotation is visible
| `drawTime` | See [drawTime](../options#draw-time).
| `height` | Overrides the height of the image. Could be set in pixel by a number, or in percentage of current height of image by a string. If undefined, uses the height of the image. It is used only when the content is an image.
| `padding` | The padding to add around the text label.
| `textAlign` | Text alignment of label content when there's more than one line. Possible options are: `'left'`, `'start'`, `'center'`, `'end'`, `'right'`.
| `width` | Overrides the width of the image. Could be set in pixel by a number, or in percentage of current width of image by a string. If undefined, uses the width of the image. It is used only when the content is an image.
| `xAdjust` | Adjustment along x-axis (left-right) of label relative to computed position. Negative values move the label left, positive right.
| `xScaleID` | ID of the X scale to bind onto, default is 'x'.
| `xValue` | X coordinate of the point in units along the x axis.
| `yAdjust` | Adjustment along y-axis (top-bottom) of label relative to computed position. Negative values move the label up, positive down.
| `yScaleID` | ID of the Y scale to bind onto, default is 'y'.
| `yValue` | Y coordinate of the point in units along the y axis.

### Styling

| Name | Description |
| ---- | ---- |
| `backgroundColor` | Fill color.
| `borderCapStyle` | Cap style of the border line. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap).
| `borderColor` | Stroke color.
| `borderDash` | Length and spacing of dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash).
| `borderDashOffset` | Offset for border line dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset).
| `borderJoinStyle` | Border line joint style. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin).
| `borderWidth` | Stroke width (in pixels).
| `color` | Text color.
| `font` | Text font.

### Position

If this value is a string (possible options are `'start'`, `'center'`, `'end'`), it is applied to vertical and horizontal position of the label, with respect to the selected point.

If this value is an object, the `x` property defines the horizontal alignment of the label, with respect to the selected point. Similarly, the `y` property defines the vertical alignment of the label, with respect to the selected point. Possible options for both properties are `'start'`, `'center'`, `'end'`. Omitted property have value of the default, `'center'`.

#### borderRadius

If this value is a number, it is applied to all corners of the rectangle (topLeft, topRight, bottomLeft, bottomRight). If this value is an object, the `topLeft` property defines the top-left corners border radius. Similarly, the `topRight`, `bottomLeft`, and `bottomRight` properties can also be specified. Omitted corners have radius of 0.