/**
 * Embroidery library exports
 */

export {
  THREAD_LIBRARY,
  findClosestThreadColor,
  getDesignThreadColors,
  validateThreadColorCount,
  type ThreadColor,
} from "./threadColors";

export {
  calculateNodeStitches,
  calculateDesignStitches,
  getStitchComplexity,
  type StitchEstimate,
  type StitchDensity,
} from "./stitchCalculator";

export {
  validateNodeForEmbroidery,
  validateDesignForEmbroidery,
  getSimplificationSuggestions,
  type EmbroideryValidation,
  type EmbroideryConstraints,
} from "./validators";

export {
  digitizeNode,
  digitizeDesign,
  simplifyGradient,
  autoVectorize,
  simplifyPath,
  type DigitizedNode,
  type DigitizationResult,
} from "./digitizer";
