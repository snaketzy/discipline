/* eslint-disable react/no-unused-state */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable jsx-quotes */
import { Component, PropsWithChildren } from 'react'
import { connect } from 'react-redux'
import { View, Text, ScrollView } from '@tarojs/components'

import { Button, DatetimePicker, Dialog, Picker, Popup } from "@taroify/core";
import { add, minus, asyncAdd } from '../../actions/counter'

import './index.less'
import moment from 'moment';

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
  subData: any[];
  open: boolean;
  height: number;
  showPopUp: boolean;
  showTimePicker:boolean;
  selectedSubDict: any;
  selectedTime: string;
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
      subData: [],
      open: false,
      height: 0,
      showPopUp:false,
      showTimePicker: false,
      selectedSubDict: undefined,
      selectedTime: ""
    }
  }
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () {
    wx.cloud.init()
    
    this.fetchData();
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
    const db = wx.cloud.database()
    const _ = db.command;
    wx.showLoading({
      title:'载入中...',
      mask: true
    })
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
        console.log(array)
        this.setState({
          data: array
        })
        wx.hideLoading()
      })
    })
  }

  /** 确认提交 */
  public confirm() {
    if(["1","2"].indexOf(this.record?.sourceId) > -1) {
      if(!this.state.selectedSubDict) {
        wx.showToast({
          title:"请选择学习内容",
          icon:"none"
        })
        return;
      }
    }
    
    if(this.state.selectedTime === "") {
      wx.showToast({
        title:"请选择归属日期",
        icon:"none"
      })
      return;
    }
    const param = {
      ...this.record,
      subSourceId: this.state.selectedSubDict ? this.state.selectedSubDict.value : "",
      subSourceName: this.state.selectedSubDict ? this.state.selectedSubDict.label : "",
      happenTime: moment(this.state.selectedTime).format("YYYY-MM-DD HH:mm:ss"),
      updateTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      value: Number(this.record.value)
    };
    delete param._id;
    delete param._openid;
    const db = wx.cloud.database()
    const _ = db.command;
    const that = this;
    db.collection('collection-discipline').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        ...param
      },
      success: function(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
        wx.showToast({
          title:"操作成功",
          icon:"none"
        })
        that.reset()
      },
      fail: function(res) {
        debugger
      }
    })
  }
  /** 重置 */
  public reset() {
    this.setState({
      open: false,
      selectedSubDict: undefined,
      selectedTime: ""
    })
    this.record = undefined;
  }

  public fetchSubDict() {
    const db = wx.cloud.database()
    const _ = db.command;
    db.collection('collection-discipline-subdict').where({
      sourceId:/1,2/i
    })
    .get()
    .then((res: any) => {
      this.setState({
        subData: res.data.map((data) => {return {label: data.subSourceName, value: data.subSourceId}})
      })
    })
  }

  render () {
    return (
      <ScrollView scrollY style={{height: this.state.height}}>
      <View className='index'>
        {
          this.state.data.length > 0 && this.state.data.map((ele: any, index: number) => {
            return <View key={index} className="income-item">
              <View>
              {ele.sourceName}
              {ele.description}  
              </View>
              <View><Button color={ele.level === "hard" ? "warning" : "primary"} size="small" onClick={() => {
                this.setState({
                  open:true
                })
                this.record = ele
              }}>收获自律点</Button></View>
              </View>
          })
        }
        <Dialog open={this.state.open} onClose={() => this.setState({open: false})}>
          <Dialog.Content>
            <View className="dialog-content">
              {`因【${this.record?.sourceName ?? "--"}】，收获自律点 ${this.record?.value ?? "--"} 点`}
            </View>
            {
              ["1","2"].indexOf(this.record?.sourceId) > -1 && 
              <View className="dialog-content">
                <Button variant="text" color="primary" onClick={() => {
                  this.fetchSubDict()
                  this.setState({showPopUp: true})
                }}>选择内容</Button>
                {this.state.selectedSubDict?.label}
              </View>
            }
            <View className="dialog-content">
              <Button variant="text" color="primary" onClick={() => {
                  this.setState({showTimePicker: true})
                }}>选择归属日期</Button>
                {this.state.selectedTime}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onClick={() => this.reset()}>取消</Button>
            <Button onClick={() => this.confirm()}>确认</Button>
          </Dialog.Actions>
        </Dialog>
        <Popup open={this.state.showPopUp} rounded style={{
            width: '90%'
          }} lock>
          <Picker
            title="选择"
            columns={this.state.subData}
            onConfirm={(value, option) => {
              this.setState({
                selectedSubDict: option[0],
                showPopUp:false
              })
            }}
            onCancel={() => this.setState({showPopUp:false})}
          >
          </Picker>
        </Popup>
        <Popup open={this.state.showTimePicker} rounded style={{
            width: '90%'
          }} lock>
          <DatetimePicker type="date-hour" defaultValue={new Date()}
            onConfirm={(date) => {
              this.setState({
                selectedTime: moment(date).format("YYYY-MM-DD HH"),
                showTimePicker:false
              })
            }}
            onCancel={() => this.setState({showTimePicker:false})}
          >
            <DatetimePicker.Toolbar>
              <DatetimePicker.Button>取消</DatetimePicker.Button>
              <DatetimePicker.Title>选择年月日小时</DatetimePicker.Title>
              <DatetimePicker.Button>确认</DatetimePicker.Button>
            </DatetimePicker.Toolbar>
          </DatetimePicker>
        </Popup>
      </View>
      </ScrollView>
    )
  }
}

export default Index

