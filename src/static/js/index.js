const details = {
  id: '1',
  audio: './static/music/old_boy_dota.mp3',
  title: 'old_boy'
}

// 添加音频控件
$.extend({
  formTime: function (time) {
    if (!time && parseFloat(time) > 0) {
      return '00:00'
    }
    var minutes = parseInt(time / 60)
    var seconds = Math.round(time % 60)
    minutes = minutes > 9 ? minutes : '0' + minutes
    seconds = seconds > 9 ? seconds : '0' + seconds
    return minutes + ':' + seconds
  },
})

window.jsAudio = new (function (that) {
  that = this

  that.audio = null // 音频对象
  that.source = null // 资源变量
  that.title = null // 资源标题
  that.currentTime = null // 当前播放时间 格式为：00:00
  that.duration = null // 资源的总时长 格式为： 00:00
  that.currentTimeEle = null // 当前播放时间盒子元素
  that.durationEle = null // 资源的总时长盒子元素
  that.playSuspend = null // 播放、暂停按钮
  that.audioTitleBox = null // 播放标题盒子
  that.titleText1 = null // 播放标题1
  that.titleText2 = null // 播放标题1
  that.audioOpen = null // 向右展开控件按钮
  that.closeWidget = null // 关闭控件按钮
  that.audioCartoon = null // 是否显示音频点击按钮
  that.audioCanvas = null // 显示为动态动画按钮
  that.audioIcon = null // 动画点击按钮
  that.myMar = null // 播放控件标题的动画定时器
  that.speed = 30 // 播放控件标题的动画时间
  that.audioBox = null // 音频控件的盒子
  that.showHideWidget = null // 6s后自动隐藏控件
  that.showTime = 6000 // 隐藏控件的时间
  that.cartoonTime = 200 // 动画的时间
  // 声明动画针的定时器
  that.setIn = null // 定时器1
  that.setIn2 = null // 定时器2
  that.setIn3 = null // 定时器3
  // 声明动画针高度
  that.distanceTop = 4 // 动画针初始高度1
  that.distanceTop2 = 8 // 动画针初始高度2
  that.distanceTop3 = 0 // 动画针初始高度3
  // 获取动画针对象
  that.strip1 = null // 动画针对象1
  that.strip2 = null // 动画针对象2
  that.strip3 = null // 动画针对象3
  // 点击播放、暂停按钮的事件控制，false播放，true暂停
  that.whetherPlay = false

  // 初始化
  that.init = function (details) {
    // details 数据资源
    // detailId 当前文章的id
    // 获取当前文章数据资源
    that.source = details
    // 判断当前是否有音频资源
    if (that.source.audio) {
      // 初始化audio
      that._audio()
      // 标题名称
      that.title = that.source.title
      // 获取当前时间元素与总时间元素盒子
      that.currentTimeEle = $('body .audio-box .current')
      that.durationEle = $('body .audio-box .duration')
      // 获取音频控件的title
      that.audioTitleBox = document.querySelector(
        'body .audio-box .audio-title'
      )
      // 获取动态添加的元素
      that.titleText1 = document.querySelector('body .audio-box .title')
      that.titleText2 = document.querySelector('body .audio-box .title2')
      that.titleText1.innerHTML = that.titleText2.innerHTML = that.title
      // console.log(that.audioTitleBox)
      that.audioCanvas = $('#audioCanvas')
      that.strip1 = $('.strip1')
      that.strip2 = $('.strip2')
      that.strip3 = $('.strip3')
      // console.log(that.audioCanvas, that.strip1)
      that.audioBox = $('.audio-box')
      that.audioIcon = $('.audio-icon')
      // console.log(that.audioBox)
      // 展开控件按钮
      that.audioOpen = $('.audio-open')
      // 关闭控件按钮
      that.closeWidget = $('.show-off')
      // 播放、暂停控件按钮
      that.playSuspend = $('.play-suspend')

      // 调用监听函数
      that._addEventlistener()
    }
  }
  // 监听播放icon
  that._addEventlistener = function () {
    // 先解绑
    $('body').off('click', '.audio-icon')
    // 再绑定监听音频控件icon
    $('body').on('click', '.audio-icon', function (e) {
      e.preventDefault()
      e.stopPropagation()
      // 开启控件
      that._openWidget()
      // 调用播放函数
      that._mayPlay()
      // 第一次点击时触发文字轮播，之后不再改变，直至音频结束、关闭
      // 显示播放器控件
      clearInterval(that.myMar)
      that.myMar = setInterval(that._marquee, that.speed)
      // 第一次播放时调用一下一次性定时器
      clearTimeout(that.showHideWidget)
      that.showHideWidget = null
      // 6s后隐藏控件,点击播放暂停按钮时才会重置一次性定时器
      that.showHideWidget = setTimeout(that._hideControl, that.showTime)
    })
    // 头部动画按钮的点击
    // 先解绑
    that.audioCanvas.off('click')
    that.audioCanvas.on('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      if (!that.whetherPlay) {
        // 调用播放函数
        that._mayPlay()
        return
      }
      // 调用取消播放函数
      that._cancelPlay()
    })

    // 点击播放或暂停按钮
    // 先解绑
    that.playSuspend.off('click')
    that.playSuspend.on('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      // 只在播放按钮被点击时的定时器
      clearTimeout(that.showHideWidget)
      that.showHideWidget = null
      // 判断当前是播放还是暂停
      if (!that.whetherPlay) {
        // 调用播放函数
        that._mayPlay()
        //
        // 2s后隐藏控件
        that.showHideWidget = setTimeout(that._hideControl, that.showTime)
        return
      }
      // 调用取消播放函数
      that._cancelPlay()
      // 6s后隐藏控件,点击播放暂停按钮时才会重置一次性定时器
      that.showHideWidget = setTimeout(that._hideControl, that.showTime)
    })

    // 点击展示控件
    that.audioOpen.off('click')
    that.audioOpen.on('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      // 重置控件，
      that._showControl()
      // 调用隐藏控件
      clearTimeout(that.showHideWidget)
      that.showHideWidget = null
      // 2s后隐藏控件
      that.showHideWidget = setTimeout(that._hideControl, that.showTime)
    })

    // 关闭控件
    that.closeWidget.on('click', function () {
      // 关闭所有定时器
      that._cancelPlay()
      // 只在关闭控件时，才会清除myMar定时器(文字无限轮播)
      clearInterval(that.myMar)
      that.myMar = null
      // 取消一次性定时器
      clearInterval(that.showHideWidget)
      that.showHideWidget = null
      // 从载资源
      that.audio.load()
      // 重置样式
      that._showControl()
      // 关闭控件
      that._closeWidget()
    })
  }
  // 开启控件
  that._openWidget = function () {
    // 当前元素隐藏
    that.audioIcon.css({ display: 'none' })
    // 播放动画显示
    that.audioCanvas.css({ display: 'block' })
    // 显示播放器控件
    that.audioBox.css({ display: 'flex' })
  }
  // 关闭控件
  that._closeWidget = function () {
    // 切换播放控件按钮
    that.audioIcon.css({ display: 'flex' })
    that.audioCanvas.css({ display: 'none' })
    // 关闭控件
    that.audioBox.css({ display: 'none' })
  }
  // 可以播放函数
  that._mayPlay = function () {
    // 先清空定时器
    clearInterval(that.setIn)
    clearInterval(that.setIn2)
    clearInterval(that.setIn3)
    // 绑定定时器
    that.setIn = setInterval(
      that._cartoon(that.distanceTop, that.strip1),
      that.cartoonTime
    )
    that.setIn2 = setInterval(
      that._cartoon(that.distanceTop2, that.strip2),
      that.cartoonTime
    )
    that.setIn3 = setInterval(
      that._cartoon(that.distanceTop3, that.strip3),
      that.cartoonTime
    )
    // 是否可以播放的控制变量
    that.whetherPlay = that._startAudio()
  }
  // 取消播放函数
  that._cancelPlay = function () {
    // 清空定时器
    clearInterval(that.setIn)
    clearInterval(that.setIn2)
    clearInterval(that.setIn3)
    that.setIn = null
    that.setIn2 = null
    that.setIn3 = null
    // 隐藏播放器控件
    // audioBox.css({ display: 'none' })
    // 关闭音频播放
    that.whetherPlay = that._stopAudio()
    // 关闭title移动定时器
    // clearInterval(that.myMar)
  }
  // 开始播放
  that._startAudio = function () {
    that.audio.play()
    that.playSuspend.addClass('pause')
    return true
  }
  // 暂停播放
  that._stopAudio = function () {
    that.audio.pause()
    that.playSuspend.removeClass('pause')
    return false
  }
  // 隐藏控件
  that._hideControl = function () {
    that.audioBox.addClass('audio-pos')
    that.audioOpen.css({ display: 'block' })
  }
  // 显示控件
  that._showControl = function () {
    that.audioBox.removeClass('audio-pos')
    that.audioOpen.css({ display: 'none' })
  }
  // 文字轮播事件
  that._marquee = function () {
    if (that.titleText1.scrollWidth <= that.audioTitleBox.scrollLeft) {
      that.audioTitleBox.scrollLeft = 0
    } else {
      that.audioTitleBox.scrollLeft++
    }
  }
  // 头部动画定时器
  that._cartoon = function (distance, btn) {
    return function () {
      if (distance == 24) {
        distance = 4
      }
      distance += 4
      btn.css({
        height: distance + 'px',
      })
    }
  }
  // 音频处理
  that._audio = function () {
    // 初始化音频资源
    that.audio = new Audio()
    that.audio.src = that.source.audio
    // 初始当前时间
    that.audio.currentTime = 0
    // timeupdate 音频播放状态
    that.audio.addEventListener('timeupdate', function () {
      console.log('音频播放中....')
      that.currentTime = $.formTime(that.audio.currentTime)
      that.currentTimeEle.html(that.currentTime)
    })
    // 获取总时间
    that.audio.addEventListener('canplay', function () {
      // console.log(that.audio.duration, ' ---')
      that.duration = $.formTime(that.audio.duration)
      that.durationEle.html(that.duration)
    })
    // 监听当前音频是否结束
    that.audio.addEventListener('ended', function () {
      console.log('音频播放结束')
      // console.log(audio.ended)
      if (that.audio.ended) {
        // 先清空定时器
        clearInterval(that.setIn)
        clearInterval(that.setIn2)
        clearInterval(that.setIn3)
        clearInterval(that.myMar)
        clearTimeout(that.showHideWidget)
        that.setIn = null
        that.setIn2 = null
        that.setIn3 = null
        that.myMar = null
        that.showHideWidget = null
        // 从载资源
        that.audio.load()
        // 关闭音频播放
        that.whetherPlay = that._stopAudio()
        // 切换播放控件按钮
        that.audioIcon.css({ display: 'flex' })
        that.audioCanvas.css({ display: 'none' })
        // 关闭控件
        that.audioBox.css({ display: 'none' })
        // 重置样式
        that._showControl()
      }
    })
  }
})()
// 音频控件初始化
jsAudio.init(details)
