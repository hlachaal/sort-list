/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, PanResponder, Animated} from 'react-native';
import styled from 'styled-components';
// need to know the y position where the list starts at
const POSITION = 0;
// need to specify the height of a single item in the list
const ROW_HEIGHT = 80;
const ITEMS = [
  {value: 0, triggered: false},
  {value: 1, triggered: false},
  {value: 2, triggered: false},
  {value: 3, triggered: false},
  {value: 4, triggered: false},
  {value: 5, triggered: false},
  {value: 6, triggered: false},
  {value: 7, triggered: false},
  {value: 8, triggered: false},
];
function getRandomColor() {
  var letters = '01234ABCDEF56789';
  var color = '#';
  for (var i = 0; i < 8; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
let colorMap = {};
for (let i = 0; i < ITEMS.length; i++) {
  colorMap[i] = getRandomColor();
}
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: ITEMS,
      listener: false,
      listenerIdx: -1,
      draggingDist: null,
      gestIdx: 0,
      point: new Animated.ValueXY(),
    };
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderGrant: (evt, gestureState) => {
        const gestIdx = Number(
          ((gestureState.y0 - POSITION) / ROW_HEIGHT).toString().split('.')[0],
        );
        const items = this.state.items;
        items.map(item => (item.triggered = false));
        items[gestIdx].triggered = true;
        const point = new Animated.ValueXY({x: 0, y: gestureState.y0});
        this.setState({
          listener: true,
          gestIdx,
          items,
          point,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        Animated.event([{y: this.state.point.y}])({
          y: gestureState.moveY - ROW_HEIGHT / 2,
        });
        this.setState({
          listenerIdx: 2,
          draggingDist: gestureState.dy,
        });
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        const items = this.state.items;
        items.map(item => (item.triggered = false));
        const draggingDist = this.state.draggingDist;
        if (draggingDist > ROW_HEIGHT || draggingDist < -ROW_HEIGHT) {
          if (draggingDist > 0) {
            const newIdx =
              Number((draggingDist / ROW_HEIGHT).toString().split('.')[0]) +
              Number(this.state.gestIdx);
            const newItems = [];
            items.map(item => newItems.push(item));
            newItems.splice(this.state.gestIdx, 1);
            newItems.splice(newIdx, 0, items[this.state.gestIdx]);
            this.setState({items: newItems});
          }
          if (draggingDist < 0) {
            const newIdx =
              Number(this.state.gestIdx) -
              Number((-draggingDist / ROW_HEIGHT).toString().split('.')[0]);
            const newItems = [];
            items.map(item => newItems.push(item));
            newItems.splice(this.state.gestIdx, 1);
            newItems.splice(newIdx, 0, items[this.state.gestIdx]);
            this.setState({items: newItems});
          }
        }
        this.setState({
          listener: false,
          listenerIdx: -1,
          draggingDist: null,
        });
      },
    });
  }
  render() {
    const {items, gestIdx, listener, listenerIdx, point} = this.state;
    const renderItem = (item, isListener) => {
      return (
        <Item
          height={ROW_HEIGHT}
          isListener={isListener}
          triggered={item.triggered}
          color={colorMap[item.value]}>
          <TouchResponder {...this._panResponder.panHandlers}>
            <Icon>#</Icon>
          </TouchResponder>
          <ItemText>{item.value}</ItemText>
        </Item>
      );
    };
    return (
      <Container>
        <Listener
          as={Animated.View}
          listenerIdx={listenerIdx}
          listener={listener}
          style={{top: point.getLayout().top}}>
          {renderItem(items[gestIdx], true)}
        </Listener>
        <List>
          {items.map((item, idx) => (
            <View key={idx}>{renderItem(item, false)}</View>
          ))}
        </List>
      </Container>
    );
  }
}
const Container = styled.ScrollView`
  flex: 1;
  background-color: white;
  height: 100%;
  top: 0;
`;
const Listener = styled.View`
  z-index: ${props => props.listenerIdx};
  display: ${props => (props.listener ? 'flex' : 'none')};
  position: absolute;
  width: 100%;
`;
const List = styled.View`
  width: 100%;
  top: 0;
`;
const Item = styled.View`
  height: ${props => props.height};
  padding: 16px;
  background-color: ${props => props.color};
  flex-direction: row;
  opacity: ${props => (!props.isListener && props.triggered ? 0.3 : 1)};
`;
const TouchResponder = styled.View``;
const Icon = styled.Text`
  font-size: 28;
`;
const ItemText = styled.Text`
  font-size: 22;
  text-align: center;
  flex: 1;
`;
