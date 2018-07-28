import React from "react";
import PropTypes from 'prop-types';

export default class LeafNode extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <span>leaf node</span>;
  }
}

LeafNode.propTypes = {
  optionalArray: PropTypes.array,
  optionalBool: PropTypes.bool,
  optionalFunc: PropTypes.func,
  optionalNumber: PropTypes.number,
  optionalObject: PropTypes.object,
  optionalString: PropTypes.string,
  optionalSymbol: PropTypes.symbol,
};