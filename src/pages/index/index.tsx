/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable jsx-quotes */
import { Component, PropsWithChildren } from 'react'
import { connect } from 'react-redux'
import { View, Text, ScrollView } from '@tarojs/components'

import { Button, Dialog } from "@taroify/core";
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

interface OwnState {
  data: any[];
  open: boolean;
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
      open: false
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
    const _ = db.command;
    db.collection('collection-discipline-dict').where({
      type:_.eq("add")
    })
    .limit(20)
    .get()
    .then((res: any) => {
      db.collection('collection-discipline-dict').where({
        type:_.eq("add")
      })
      .skip(20)
      .get()
      .then((nextRes: any) => {
        const array = [...res.data,...nextRes.data]
        // array.forEach(ele => {
        //   console.log(ele.sourceName)
        // })
        this.setState({
          data: array
        })
      })
    })
  }

  public confirm() {
    this.setState({
      open: false
    })
  }

  render () {
    return (
      <ScrollView scrollY style={{height: "100%"}}>
      <View className='index'>
        {
          this.state.data.length > 0 && this.state.data.map((ele: any, index: number) => {
            return <View key={index} className="income-item">
              <View>
              {ele.sourceName}
              {ele.description}  
              </View>
              <View><Button color={ele.level === "hard" ? "danger" : "primary"} size="small" onClick={() => {
                this.setState({
                  open:true
                })
                this.record = ele
              }}>获得自律点</Button></View>
              </View>
          })
        }
        <Dialog open={this.state.open} onClose={() => this.setState({open: false})}>
          <Dialog.Content><View className="dialog-content">{`因【${this.record?.sourceName ?? "--"}】，获得自律点`}</View></Dialog.Content>
          <Dialog.Actions>
            <Button onClick={() => this.confirm()}>取消</Button>
            <Button onClick={() => this.confirm()}>确认</Button>
          </Dialog.Actions>
        </Dialog>
      </View>
      </ScrollView>
    )
  }
}

export default Index

