/* eslint-disable react/no-unused-state */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable jsx-quotes */
import { Component, PropsWithChildren } from 'react'
import { connect } from 'react-redux'
import { View, Text, ScrollView } from '@tarojs/components';
import moment from "moment";
import { Button, Dialog, Popup } from "@taroify/core";
import CustCalendar from '../../component/Calendar';
// import CustCalendar from '../../component/Calendar';
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
  todayEarnPoints: number;
  todayPunishPoints: number;
  todayDeletePoints: number;
  dateData: any;
  addPoint: any;
  deletePoint: any;
  punishPoint: any;
  allData: any[];
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
      todayEarnPoints: 0,
      todayPunishPoints: 0,
      todayDeletePoints: 0,
      dateData: undefined,
      allData: [],
      addPoint: 0,
      deletePoint: 0,
      punishPoint: 0
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

  componentDidHide () { 
    
  }

  public fetchData() {
    const that = this;
    const db = wx.cloud.database()
    const _ = db.command;
    wx.showLoading({
      title:'载入中...',
      mask: true
    })


    db.collection('collection-discipline').count().then(async(res) =>{
      let total = res.total;
      // 计算需分几次取
      const batchTimes = Math.ceil(total / 20)
      // 承载所有读操作的 promise 的数组
      let tasks: any[] = []
      for (let i = 0; i < batchTimes; i++) {
        await db.collection('collection-discipline').skip(i * 20).limit(20).get().then(subRes =>{
          // console.log(res.data)
          tasks = tasks.concat(subRes.data)
          if(i === batchTimes -1) {
            wx.hideLoading()
            this.handleData(tasks)
          }
        })
      }
    })

   


    // db.collection('collection-discipline').count().then(async(res: any) =>{
    //   let total = res.total;
    //   console.log(total)
    //   if(total === 0) {
    //     that.setState({
    //       allPoints: 0,
    //       availablePoints: 0,
    //       todayPoints: 0
    //     },() => {
    //       console.log(that.state.data)
    //       wx.hideLoading()
    //     })
    //   } else {
    //     // 计算需分几次取
    //     const batchTimes = Math.ceil(total / 20)
    //     let allData:any[] = []
    //     let new_data:any[] = [];
    //     let old_data:any[] = [];
    //     let allPoints:any;
    //     let availablePoints:any;
    //     let todayPoints:any;
    //     const initData = [];

    //     // 承载所有读操作的 promise 的数组
    //     for (let i = 0; i < batchTimes; i++) {
    //       let data:any =[];
    //       debugger
    //       await db.collection('collection-discipline').skip(i * 20).limit(20).get().then(async(subRes: any) => {
    //         const initEle = {value: 0};
    //         new_data = subRes.data
    //         old_data = data;
    //         allData =  old_data.concat(new_data)
    //         data = allData;
    //         debugger
    //         // allPoints = (old_data.concat(new_data) || []).reduce((pre,next) => { return {value: pre.value + next.value}} ,initEle);
    //         // availablePoints = (old_data.concat(new_data) || []).reduce((pre,next) => { 
    //         //   if(moment(next.happenTime).format("YYYY-MM-DD") !== moment().format("YYYY-MM-DD")) {
    //         //     return {value: pre.value + next.value}
    //         //   } else {
    //         //     return {value: pre.value}
    //         //   }
    //         // },initEle);
    //         // todayPoints = old_data.concat(new_data).reduce((pre,next) => { 
    //         //   if(moment(next.happenTime).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
    //         //     return {value: pre.value + next.value}
    //         //   } else {
    //         //     return {value: pre.value}
    //         //   }
    //         // },initEle);
           
    //       })
    //     }
         
    //     debugger
    //     that.setState({
    //       data: allData,
    //       allData:allData,
    //       allPoints: allPoints.value,
    //       availablePoints: availablePoints.value,
    //       todayPoints: todayPoints.value
    //     },() => {
    //       console.log(that.state.data)
    //       wx.hideLoading()
    //     })
    //   }
      
      
    // })
  }

  public handleData = (data) =>{
      let allData:any[] = [];
      let new_data:any[] = [];
      let old_data:any[] = [];
      let allPoints:any;
      let availablePoints:any;
      let todayEarnPoints:any;
      let todayPunishPoints:any;
      let todayDeletePoints:any;
      const initData = [];
      const initEle = {value: 0};

      allPoints = data.reduce((pre,next) => { return {value: pre.value + next.value}} ,initEle);
      availablePoints = data.reduce((pre,next) => { 
        if(moment(next.happenTime).format("YYYY-MM-DD") !== moment().format("YYYY-MM-DD") || next.type !== "add") {
          return {value: pre.value + next.value}
        } else {
          return {value: pre.value}
        }
      },initEle);
      todayEarnPoints = data.reduce((pre,next) => { 
        if(moment(next.happenTime).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") && next.type ==="add") {
          return {value: pre.value + next.value}
        } else {
          return {value: pre.value}
        }
      },initEle);
      todayPunishPoints = data.reduce((pre,next) => { 
        if(moment(next.happenTime).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") && next.type ==="punish") {
          return {value: pre.value + next.value}
        } else {
          return {value: pre.value}
        }
      },initEle);
      todayDeletePoints = data.reduce((pre,next) => { 
        if(moment(next.happenTime).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") && next.type ==="delete") {
          return {value: pre.value + next.value}
        } else {
          return {value: pre.value}
        }
      },initEle);

      this.setState({
        allPoints: allPoints.value,
        availablePoints: availablePoints.value,
        todayEarnPoints: todayEarnPoints.value,
        todayPunishPoints: todayPunishPoints.value,
        todayDeletePoints: todayDeletePoints.value,
      },() => {
        this.setState({
          allData:data,
        },() => {
          const that = this;
          const app = getApp();
          const momentObj = moment
          let date;
          if(app.$app.globalData.date) {
            date = app.$app.globalData.date
          } else {
            date = momentObj().format("YYYY-MM")
          }
          
          
          const addPoint = that.state.allData.filter(ele => {
            return momentObj(ele.happenTime).format("YYYY-MM") === date && ele.type === "add"
          }).reduce((pre,next) => { return {value: pre.value + next.value}}, {value: 0}).value;
          const deletePoint = that.state.allData.filter(ele => {
            return momentObj(ele.happenTime).format("YYYY-MM") === date && ele.type === "delete"
          }).reduce((pre,next) => { return {value: pre.value + next.value}}, {value: 0}).value
          const punishPoint = that.state.allData.filter(ele => {
            return momentObj(ele.happenTime).format("YYYY-MM") === date && ele.type === "punish"
          }).reduce((pre,next) => { return {value: pre.value + next.value}}, {value: 0}).value ;
          
          this.setState({
            addPoint,
            deletePoint: Math.abs(deletePoint),
            punishPoint: Math.abs(punishPoint)
          })
        })
        console.log(this.state.data)
      })
  }

  public custDayRender = (dayProps) => {
    const isToday = dayProps.isToday;
    const existData = this.state.allData.filter(ele => {
      const date = moment(ele.happenTime).format("YYYY-MM-DD");
      return date === dayProps.dateFormate
    }).length > 0 ? true : false;
    const addCount = this.state.allData.filter(ele => {
      const date = moment(ele.happenTime).format("YYYY-MM-DD");
      return date === dayProps.dateFormate && ele.type === "add"
    }).length
    const deleteCount = this.state.allData.filter(ele => {
      const date = moment(ele.happenTime).format("YYYY-MM-DD");
      return date === dayProps.dateFormate && ele.type === "delete"
    }).length
    const punishCount = this.state.allData.filter(ele => {
      const date = moment(ele.happenTime).format("YYYY-MM-DD");
      return date === dayProps.dateFormate && ele.type === "punish"
    }).length
    
    return (
      <>
        <View className={isToday ? "today" : dayProps.notCurMonth ? "notCurMonth" : ""}>{dayProps.day}</View>
        {existData && <View className="tips">{addCount > 0 ? "收" : ""} {deleteCount > 0 ? <text style={{color:"green"}}>支</text> : ""} {punishCount > 0 ? <text style={{color:"red"}}>扣</text> : ""}</View>}
      </>
    );
  };
  public onDayClick = (info,dateFormate) => {
    
    const clickDate = moment(`${info.year}-${info.month}-${info.day}`).format("YYYY-MM-DD");
    const matchData = this.state.allData.filter(ele => {
      console.log("happenTime", moment(ele.happenTime).format("YYYY-MM-DD"))
      return moment(ele.happenTime).format("YYYY-MM-DD") === dateFormate
    });
    console.log("info", info)
    console.log("dateFormate", dateFormate)
    
    console.log("所有数据",this.state.allData)
    console.log("当前日期匹配数据",matchData)
    this.setState({
      dateData: matchData
      
    },() => {
      this.setState({
        open:true  
      })
    })
  };
  public custWeekRender = (weekItem: string) => {
    return (
      <View style={['六', '日'].includes(weekItem) ? { color: 'red' } : {}}>
        {weekItem}
      </View>
    );
  };

  render () {
    
    return (
      <ScrollView scrollY style={{height: this.state.height}}>
        <View className='index'>
            <View>全部自律点：<text style={{color:"#1890ff"}}>{this.state.allPoints}</text></View>
            <View>可用自律点(今天收获的自律点不可用)：<text style={{color:"#1890ff"}}>{this.state.availablePoints}</text></View>
            <View>今天收获的自律点：<text style={{color:"#1890ff"}}>{this.state.todayEarnPoints}</text></View>
            <View>今天消费的自律点：<text style={{color:"green"}}>{Math.abs(this.state.todayDeletePoints)}</text></View>
            <View>今天扣除的自律点：<text style={{color:"red"}}>{Math.abs(this.state.todayPunishPoints)}</text></View>
        </View>
        {
          this.state.allData.length > 0 && 
          <CustCalendar
            // currentView='2024-07-24'
            // selectedDate='2024-07-29'
            view="month"
            selectedDateColor="#346fc2"
            custDayRender={this.custDayRender}
            custWeekRender={this.custWeekRender}
            onDayClick={this.onDayClick}
            onCurrentViewChange={(date) => {
              const momentObj = moment
              const that = this;
              const addPoint = that.state.allData.filter(ele => {
                return momentObj(ele.happenTime).format("YYYY-MM") === date && ele.type === "add"
              }).reduce((pre,next) => { return {value: pre.value + next.value}}, {value: 0}).value;
              const deletePoint = that.state.allData.filter(ele => {
                return momentObj(ele.happenTime).format("YYYY-MM") === date && ele.type === "delete"
              }).reduce((pre,next) => { return {value: pre.value + next.value}}, {value: 0}).value
              const punishPoint = that.state.allData.filter(ele => {
                return momentObj(ele.happenTime).format("YYYY-MM") === date && ele.type === "punish"
              }).reduce((pre,next) => { return {value: pre.value + next.value}}, {value: 0}).value ;
              
              this.setState({
                addPoint,
                deletePoint: Math.abs(deletePoint),
                punishPoint: Math.abs(punishPoint)
              })
              const app = getApp()
              app.$app.globalData.date = date;
              return date
            }}
          />
        }
        {
          this.state.allData.length > 0 &&
          <View className='count'>本月收获 <Text style="color:#1890ff"> { this.state.addPoint } </Text> 点，消费 <Text style="color:green"> { this.state.deletePoint } </Text> 点，扣除 <Text style="color:red"> { this.state.punishPoint } </Text> 点</View>
        }
       
        <Popup
          open={this.state.open}
          style={{
            padding: "16px",
            width: 300
          }}
          rounded
          lock={false}
          onClick={()=>this.setState({open:false})}
          onClose={()=>this.setState({open:false})}
        >
          {
            (this.state.dateData && this.state.dateData.length > 0) ? <View style="height:500px">
              <View style="height:450px;overflow:scroll">
                <View>
                  {this.state.dateData.map((ele, eleIndex) => <View key={eleIndex} style={{marginBottom: 16}}>
                    <View> {ele.sourceName}{ele.subSourceName ? `-${ele.subSourceName}` : ""}</View>
                    <View style={{display:"flex",justifyContent:"space-between"}}>
                      <View style={{color: ele.type === "add" ? "#1890ff" : "#ff0000"}}>{ele.value} 点 </View>  
                      <View>{ele.type === "add" ? "收获时间" : ele.type === "delete" ? "消费时间" : "扣除时间"} : { ele.happenTime }</View>
                    </View>
                  </View>)}  
                </View>
              </View>
              
              <View className='popup-count' style="height:50px;">合计 {this.state.dateData.reduce((pre,next) => { return {value: pre.value + next.value}} ,{value: 0}).value} 点</View>
            </View>
            :
            <View style={{display:"flex",justifyContent:"center"}}>无数据</View>
          }
        </Popup>
      </ScrollView>
    )
  }
}

export default Index

