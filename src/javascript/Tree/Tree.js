import {
  AppBar,
  List,
  ListItem,
  RaisedButton,
  Chip,
  Paper,
  BottomNavigation,
  BottomNavigationItem,
  FontIcon,
  IconButton,
  FlatButton,
  Snackbar,
  Dialog
} from "material-ui";
import React from "react";
import {
  CSSTransition,
  TransitionGroup,
  Transition
} from "react-transition-group";
import { observer, Provider, inject } from "mobx-react";
@observer
export class Tree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      in: false
    };
  }

  toggleEnterState = () => {
    this.setState({ in: !this.state.in });
  };

  addNode() {}

  renderNode(node, level, visibleLevel, key) {
    level++;
    let visible = visibleLevel <= level;
    //does this node have ideas?
    if (node.ideas) {
      return (
        <div>
          {visible ? (
            <TransitionGroup>
              <Transition key={key} timeout={300}>
                {status => (
                  <div>
                    {status}
                    <Node
                      className={`fade fade-${status}`}
                      key={key}
                      title={node.title}
                      visible={node.visible}
                      hasNote={!!node.note}
                      handleNodeToggle={() => this.props.handleNodeToggle(node)}
                      handleNodeEdit={() => this.props.handleNodeEdit(node)}
                      handleNodeAdd={() => this.props.handleNodeAdd(node)}
                      hasChildren={true}
                    />
                  </div>
                )}
              </Transition>
            </TransitionGroup>
          ) : (
            ""
          )}
          {node.visible ? (
            <ul style={visible ? {} : { padding: "0px" }}>
              {Object.keys(node.ideas).map(key => {
                return this.renderNode(
                  node.ideas[key],
                  level,
                  visibleLevel,
                  key
                );
              })}
            </ul>
          ) : (
            ""
          )}
        </div>
      );
    }
    if (visible) {
      return (
        <Node
          key={key}
          title={node.title}
          visible={node.visible}
          handleNodeToggle={() => this.props.handleNodeToggle(node)}
          handleNodeEdit={() => this.props.handleNodeEdit(node)}
          handleNodeAdd={() => this.props.handleNodeAdd(node)}
          hasChildren={false}
        />
      );
    }
    return "";
  }

  render() {
    return (
      <div>
        <NodeEditDialog
          node={this.props.nodeEdited}
          handleOpen={this.props.handleNodeEditOpen}
          handleClose={this.props.handleNodeEditClose}
        />
        {Object.keys(this.props.nodeList).map(key => {
          return (
            <List>
              {this.renderNode(
                this.props.nodeList[key],
                0,
                this.props.level,
                key
              )}
            </List>
          );
        })}
      </div>
    );
  }
}
@observer
export class Node extends React.Component {
  constructor(props) {
    super(props);
  }

  testHtml(title) {
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(expression);
    return title.match(regex);
  }

  renderExpandCollapse(visibile, hasChildren) {
    if (hasChildren) {
      return this.props.visible ? (
        <IconButton onClick={this.props.handleNodeToggle}>
          <FontIcon className="fa fa-minus" />
        </IconButton>
      ) : (
        <IconButton onClick={this.props.handleNodeToggle}>
          <FontIcon className="fa fa-plus" />
        </IconButton>
      );
    }
    return (
      <span>
        <IconButton onClick={this.props.handleNodeToggle}>
          <FontIcon className="fa fa-leaf" />
        </IconButton>
      </span>
    );
  }

  render() {
    let { visible, hasChildren } = this.props;
    return (
      <ListItem className="idea">
        {this.renderExpandCollapse(visible, hasChildren)}
        {!this.testHtml(this.props.title) ? (
          <span>{this.props.title}</span>
        ) : (
          <a target="_blank" href={this.props.title}>
            {this.props.title}
          </a>
        )}
        {this.props.hasNote ? (
          <IconButton className="pull-right">
            <FontIcon className="material-icons">note</FontIcon>
          </IconButton>
        ) : (
          ""
        )}
        <IconButton onClick={this.props.handleNodeEdit} className="pull-right">
          <FontIcon className="material-icons">create</FontIcon>
        </IconButton>
        <FlatButton
          secondary
          onClick={this.props.handleNodeAdd}
          className="pull-right"
        >
          +
        </FlatButton>
      </ListItem>
    );
  }
}
@inject("branchitStore")
@observer
export class NodeEditDialog extends React.Component {
  handleOpen = () => {
    this.props.branchitStore.nodeEditOpen = true;
  };

  handleClose = () => {
    this.props.branchitStore.nodeEditOpen = false;
  };

  render() {
    let branchitStore = this.props.branchitStore;
    const actions = [
      <FlatButton label="Cancel" primary={true} onClick={this.handleClose} />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleClose}
      />
    ];
    return (
      <div>
        <Dialog
          title={branchitStore.nodeEdited.title}
          actions={actions}
          modal={false}
          open={branchitStore.nodeEditOpen}
          onRequestClose={this.handleClose}
          autoScrollBodyContent={true}
        >
          <p
            dangerouslySetInnerHTML={{ __html: branchitStore.nodeEdited.note }}
          />
        </Dialog>
      </div>
    );
  }
}
