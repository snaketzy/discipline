/* eslint-disable react/no-unused-state */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable jsx-quotes */
import { Component, PropsWithChildren } from 'react'
import { connect } from 'react-redux'
import { View, Text, ScrollView } from '@tarojs/components';
import moment from "moment";

import { Button, Dialog } from "@taroify/core";
import { add, minus, asyncAdd } from '../../actions/counter'

import './index.less';

// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type PageStateProps = {
  counter: {
    num: number
  }
}

type PageDispatchProps = {
  add: () => void
  dec: () => void
  asyncAdd: () => any
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

interface OwnState {
  data: any[];
  open: boolean;
  height: number;
  allPoints: number;
  availablePoints: number;
  todayPoints: number;
}

@connect(({ counter }) => ({
  counter
}), (dispatch) => ({
  add () {
    dispatch(add())
  },
  dec () {
    dispatch(minus())
  },
  asyncAdd () {
    dispatch(asyncAdd())
  }
}))
class Index extends Component<PropsWithChildren,OwnState> {

  public record: any;
  constructor(props){
    super(props); 
    this.state = {
      data: [],
      open: false,
      height:0,
      allPoints: 0,
      availablePoints: 0,
      todayPoints: 0
    }
  }
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () {
    wx.cloud.init()
    
    this.fetchData()
    wx.getSystemInfo({
      success: (res) => {
        const menuBottomInfo = wx.getMenuButtonBoundingClientRect();
        this.setState({
          height: res.safeArea.height - menuBottomInfo.bottom - 20
        })
      }
    });
   }

  componentDidHide () { }

  public fetchData() {
    const that = this;
    const db = wx.cloud.database()
    const _ = db.command;
    wx.showLoading({
      title:'载入中...',
      mask: true
    })
    db.collection('collection-discipline').count().then(async(res: any) =>{
      let total = res.total;
      console.log(total)
      if(total === 0) {
        that.setState({
          allPoints: 0,
          availablePoints: 0,
          todayPoints: 0
        },() => {
          console.log(that.state.data)
          wx.hideLoading()
        })
      } else {
        // 计算需分几次取
        const batchTimes = Math.ceil(total / 20)
        // 承载所有读操作的 promise 的数组
        for (let i = 0; i < batchTimes; i++) {
          await db.collection('collection-discipline').skip(i * 20).limit(20).get().then(async(subRes: any) => {
            const initEle = {value: 0};
            let new_data = subRes.data
            let old_data = that.state.data;
            let allPoints = (old_data.concat(new_data) || []).reduce((pre,next) => { return {value: pre.value + next.value}} ,initEle);
            let availablePoints = (old_data.concat(new_data) || []).reduce((pre,next) => { 
              if(moment(next.happenTime).format("YYYY-MM-DD") !== moment().format("YYYY-MM-DD")) {
                return {value: pre.value + next.value}
              } else {
                return {value: pre.value}
              }
            },initEle);
            let todayPoints = old_data.concat(new_data).reduce((pre,next) => { 
              if(moment(next.happenTime).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
                return {value: pre.value + next.value}
              } else {
                return {value: pre.value}
              }
            },initEle);
            
            that.setState({
              allPoints: allPoints.value,
              availablePoints: availablePoints.value,
              todayPoints: todayPoints.value
            },() => {
              console.log(that.state.data)
              wx.hideLoading()
            })
          })
        }
      }
      
      
    })
  }

  render () {
    return (
      <ScrollView scrollY style={{height: this.state.height}}>
        <View className='index'>
            <View>全部自律点：<text>{this.state.allPoints}</text></View>
            <View>可用自律点(今天获得的自律点不可用)：<text>{this.state.availablePoints}</text></View>
            <View>今天获得的自律点：<text>{this.state.todayPoints}</text></View>
        </View>
        
      </ScrollView>
    )
  }
}

export default Index

