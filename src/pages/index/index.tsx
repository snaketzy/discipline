import { Component, PropsWithChildren } from 'react'
import { connect } from 'react-redux'
import { View, Button, Text } from '@tarojs/components'

import { add, minus, asyncAdd } from '../../actions/counter'

import './index.less'

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
class Index extends Component<PropsWithChildren> {
  constructor(props){
    super(props); 
    this.state = {
      data: undefined
    }
  }
  componentWillReceiveProps (nextProps) {
    debugger
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () {
    wx.cloud.init()
    
    this.fetchData()
   }

  componentDidHide () { }

  public fetchData() {
    const db = wx.cloud.database()
    db.collection('collection-discipline').doc('f380561066a113b4000bfcf81d7d12c4').get().then(res => {
      this.setState({
        data: res.data
      })
    })
    
  }

  render () {
    return (
      <View className='index'>
        <View>当前自律点数 {this.state.data?.value}</View>
        <View>当前自律点数获得时间 {this.state.data?.createTime}</View>
      </View>
    )
  }
}

export default Index

