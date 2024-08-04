/* eslint-disable react/no-unused-state */
/* eslint-disable import/no-named-as-default */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable jsx-quotes */
import { Component, PropsWithChildren } from 'react'
import { connect } from 'react-redux'
import { View, Text, ScrollView } from '@tarojs/components'
import VChart from '@visactor/taro-vchart';

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


  render () {
    const lineSpec = {
      type: 'line',
      data: {
        values: [
          { date: '01', type: '收获', value: 99.9 },
          { date: '01', type: '消费', value: 96.6 },
          { date: '01', type: '扣除', value: 96.2 },
          { date: '02', type: '收获', value: 96.7 },
          { date: '02', type: '消费', value: 91.1 },
          { date: '02', type: '扣除', value: 93.4 },
          { date: '03', type: '收获', value: 100.2 },
          { date: '03', type: '消费', value: 99.4 },
          { date: '03', type: '扣除', value: 91.7 },
          { date: '04', type: '收获', value: 104.7 },
          { date: '04', type: '消费', value: 108.1 },
          { date: '04', type: '扣除', value: 93.1 },
          { date: '05', type: '收获', value: 95.6 },
          { date: '05', type: '消费', value: 96 },
          { date: '05', type: '扣除', value: 92.3 },
          { date: '06', type: '收获', value: 95.6 },
          { date: '06', type: '消费', value: 89.1 },
          { date: '06', type: '扣除', value: 92.5 },
          { date: '07', type: '收获', value: 95.3 },
          { date: '07', type: '消费', value: 89.2 },
          { date: '07', type: '扣除', value: 95.7 },
          { date: '08', type: '收获', value: 96.1 },
          { date: '08', type: '消费', value: 97.6 },
          { date: '08', type: '扣除', value: 99.9 },
          { date: '09', type: '收获', value: 96.1 },
          { date: '09', type: '消费', value: 100.6 },
          { date: '09', type: '扣除', value: 103.8 },
          { date: '10', type: '收获', value: 101.6 },
          { date: '10', type: '消费', value: 108.3 },
          { date: '10', type: '扣除', value: 108.9 },
          { date: '11', type: '收获', value: 101.6 },
          { date: '11', type: '消费', value: 108.3 },
          { date: '11', type: '扣除', value: 108.9 },
          { date: '12', type: '收获', value: 101.6 },
          { date: '12', type: '消费', value: 108.3 },
          { date: '12', type: '扣除', value: 108.9 }
        ]
      },
      xField: 'date',
      yField: 'value',
      seriesField: 'type',
      point: {
        visible: true
      },
      line: {
        style: {
          lineWidth: 1
        }
      },
      legends: { visible: true }
    };

    const pieSpec = {
      type: 'common',
      data: [
        {
          id: 'id0',
          values: [
            { type: '0~29', value: '126.04' },
            { type: '30~59', value: '128.77' },
            { type: '60 and over', value: '77.09' }
          ]
        },
        {
          id: 'id1',
          values: [
            { type: '0~9', value: '39.12' },
            { type: '10~19', value: '43.01' },
            { type: '20~29', value: '43.91' },
            { type: '30~39', value: '45.4' },
            { type: '40~49', value: '40.89' },
            { type: '50~59', value: '42.48' },
            { type: '60~69', value: '39.63' },
            { type: '70~79', value: '25.17' },
            { type: '80 and over', value: '12.29' }
          ]
        }
      ],
      series: [
        {
          type: 'pie',
          dataIndex: 0,
          outerRadius: 0.65,
          innerRadius: 0,
          valueField: 'value',
          categoryField: 'type',
          label: {
            position: 'inside',
            visible: true,
            style: {
              fill: 'white'
            }
          },
          pie: {
            style: {
              stroke: '#ffffff',
              lineWidth: 2
            }
          }
        },
        {
          type: 'pie',
          dataIndex: 1,
          outerRadius: 0.8,
          innerRadius: 0.67,
          valueField: 'value',
          categoryField: 'type',
          label: {
            visible: true
          },
          pie: {
            style: {
              stroke: '#ffffff',
              lineWidth: 2
            }
          }
        }
      ],
      color: ['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00'],
      title: {
        visible: false,
        text: 'Population Distribution by Age in the United States, 2021 (in millions)',
        textStyle: {
          fontFamily: 'Times New Roman'
        }
      },
      legends: {
        visible: false,
        orient: 'left'
      }
    }
    return (
      <ScrollView scrollY style={{height: "100%"}}>
      <View className='index'>
        {/* <VChart
          type="weapp"
          spec={lineSpec}
          canvasId="line"
          style={{ height: '35vh', width: '100%' }}
          onChartInit={() => {
            console.log('init pie');
          }}
          onChartReady={() => {
            console.log('ready pie');
          }}
          onChartUpdate={() => {
            console.log('update pie');
          }}
        />
        <VChart
          type="weapp"
          spec={pieSpec}
          canvasId="pie"
          style={{ height: '35vh', width: '100%' }}
          onChartInit={() => {
            console.log('init pie');
          }}
          onChartReady={() => {
            console.log('ready pie');
          }}
          onChartUpdate={() => {
            console.log('update pie');
          }}
        /> */}
      </View>
      </ScrollView>
    )
  }
}

export default Index

