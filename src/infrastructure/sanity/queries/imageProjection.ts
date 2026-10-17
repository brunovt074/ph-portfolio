export const imageProjection = `{
  hotspot,
  "asset": asset->{ _id, "lqip": metadata.lqip, "width": metadata.dimensions.width, "height": metadata.dimensions.height }
}`;
