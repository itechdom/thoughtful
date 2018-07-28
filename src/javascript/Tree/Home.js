import {
  AppBar,
  RaisedButton,
  FlatButton,
  Chip,
  Paper,
  BottomNavigation,
  BottomNavigationItem,
  FontIcon,
  IconButton,
  Snackbar,
  TextField,
  GridList,
  GridTile,
  List,
  ListItem,
  AutoComplete,
  CircularProgress,
  RefreshIndicator
} from "material-ui";
import { Tree } from "./Tree.js";
import React from "react";
import { observer, Provider, inject } from "mobx-react";
@inject("branchitStore")
@observer
export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      in: false
    };
  }

  handleUpdateInput = title => {
    this.props.branchitStore.filterFilesByTitle(title);
  };

  onManualSearch = title => {
    this.props.branchitStore.getFiles(title);
  };

  onNewRequest = title => {
    // this.props.branchitStore.filterFilesByTitle(title);
    this.props.branchitStore.downloadFile();
  };



  render() {
    let {
      ideaList,
      level,
      fileList,
      files,
      onFileDownload,
      ideas
    } = this.props.branchitStore;
    let branchitStore = this.props.branchitStore;
    return (
      <div>
        <RefreshIndicator
          size={40}
          left={10}
          top={0}
          status={branchitStore.loading ? "loading" : "hide"}
          loadingColor={"green"}
        />
        <List>
          <ListItem
            disabled={true}
            hoverColor="transparent"
            disableKeyboardFocus={true}
            className="grid"
          >
            <AutoComplete
              hintText="Search Mindmaps"
              dataSource={files}
              onUpdateInput={this.handleUpdateInput}
              onNewRequest={this.onNewRequest}
              floatingLabelText="Type the name of the file"
              id="home__search"
              className="grid-item"
            />
          </ListItem>
        </List>
        <div>
          {/* <RaisedButton
                label={"-"}
                onClick={() => { branchitStore.decremenetLevel() }}
            />
            <RaisedButton
                label={"+"}
                onClick={() => { branchitStore.incrementLevel() }}
            /> */}
          <Tree
            nodeList={ideas}
            nodeEdited={branchitStore.nodeEdited}
            nodeEditedOpen={branchitStore.nodeEditedOpen}
            level={level}
            handleNodeToggle={node => {
              branchitStore.toggleChildVisible(node);
            }}
            handleNodeEdit={node => {
              branchitStore.nodeEdited = node;
              branchitStore.nodeEditOpen = true;
            }}
            handleNodeEditClose={() => {
              branchitStore.nodeEditedOpen = false;
              //save whatever you want here
            }}
            handleNodeEditOpen={() => {
              branchitStore.nodeEditedOpen = true;
            }}
            handleNodeAdd={node => {
              //this the parent
              console.log(branchitStore);
              branchitStore.addIdea(node);
              console.log("node parent", node);
            }}
          />
        </div>
      </div>
    );
  }
}
