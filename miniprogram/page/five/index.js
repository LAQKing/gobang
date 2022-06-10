// page/five/index.js
const app = getApp()
Page({
    /**
     * 页面的初始数据
     */
    data: {
        piece: 15, // 棋子的数量
        pieceArr: [], //棋子数组
        boardWh: parseInt(630 / 14), //棋盘格子宽高
        typeClass: 'black', //下棋类型（白起、黑棋）
        name1: '微信用户', //用户1
        img1: '', //用户1头像
        name2: '', //用户2
        img2: '', //用户2头像
        isShowChoose: true,
        isAI: false,
        free: 1, // 1黑棋先手，2白棋先手
        isWin: false,
        winTxt: ''
    },
    resetId: '', //记录要悔棋的id
    existChesses: [], // 记录落下的棋子
    over: false, // 是否结束
    player: true, // true:我  false:电脑
    allChesses: [], // 所有棋子
    winsCount: 0, // 赢法总数
    wins: [], // 所有赢法统计
    myWins: [], //我的赢法统计
    computerWins: [], //电脑赢法统计
    getUser() {
        let userInfo = wx.getStorageSync('userInfo');
        let that = this;
        if (!userInfo) {
            app.checkUserInfo(res => {
                that.setUserPhoto(res)
            })
        }
    },
    // AI机器人对战
    aiPlay() {
        this.setData({
            name1: 'AI机器人',
            img1: '../../image/AI.png',
            isShowChoose: false,
            isAI: true
        })
    },
    // 再来一局
    aganFun() {
        this.resetId = '';
        this.existChesses = [],
            this.over = false,
            this.player = true,
            this.allChesses = [],
            this.winsCount = 0,
            this.wins = [],
            this.myWins = [],
            this.computerWins = [],
            this.createPiece()
        this.AiInit()
        this.setData({
            isWin: false
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        this.createPiece()
        let userInfo = wx.getStorageSync('userInfo');
        this.setUserPhoto(userInfo)
        this.AiInit()
    },
    // 设置用户名称、头像
    setUserPhoto(res) {
        let name = res && res.nickName;
        let img = res && res.avatarUrl;
        if (this.data.typeClass == 'black') {
            this.setData({
                name2: name,
                img2: img
            })
        } else {
            this.setData({
                name1: name,
                img1: img
            })
        }
    },

    // 悔棋
    regretPiece() {
        let arr = this.existChesses;
        let len = this.existChesses.length;
        if (this.resetId != '') {
            let v1 = arr[len - 1].id;
            let v2 = arr[len - 2].id;
            let x1 = arr[len - 1].x;
            let y1 = arr[len - 1].y;
            let x2 = arr[len - 2].x;
            let y2 = arr[len - 2].y;
            let idx = this.resetId;
            let pieceArr = this.data.pieceArr;
            pieceArr[v1].value = 0;
            pieceArr[v1].typeClass = '';
            pieceArr[v2].value = 0;
            pieceArr[v2].typeClass = '';
            this.allChesses[x1][y1] = false;
            this.allChesses[x2][y2] = false;
            this.existChesses.splice(len - 2, 2)

            this.resetId = '';
            this.setData({
                pieceArr
            })
        }
    },
    // 下棋
    clickRange(e) {
        let pieceArr = this.data.pieceArr; // 全部棋子
        let value = e.currentTarget.dataset.value;
        let idx = e.currentTarget.id;
        let typeClass = this.data.typeClass;
        let isAI = this.data.isAI; // 是否AI对战
        if (value != 0) return; //判断该棋子是否已存在
        pieceArr[idx].value = idx == 0 ? 0.1 : idx;
        pieceArr[idx].typeClass = typeClass;
        pieceArr[idx].ches = 'ches';
        this.resetId = idx;
        this.setData({
            pieceArr
        })
        let that = this;
        if (isAI) {
            this.checkChess(idx)
            if (!that.over) {//游戏没结束，下一步由AI下棋
                that.player = false;
                that.AiRobotPlayChess(idx); //AI机器人落子
            }
        } else {
            this.playChess(pieceArr, typeClass);
        }
    },

    // 人人对战-判断输赢
    playChess(arr, clas) {
        let piece = this.data.piece;
        let term1 = '';
        let term2 = '';
        for (let i = 0; i < arr.length; i++) {
            let y = parseInt(arr[i].value / piece); // 棋子行坐标
            let x = arr[i].value % piece; // 棋子列坐标
            // 右下斜线
            if (x <= piece - 5 && y <= piece - 5 && arr[i].value != 0 && arr[i].typeClass == clas) {
                term1 = arr[i + 1 * piece + 1].value != 0 && arr[i + 2 * piece + 2].value != 0 && arr[i + 3 * piece + 3].value != 0 && arr[i + 4 * piece + 4].value != 0;
                term2 = arr[i + 1 * piece + 1].typeClass == clas && arr[i + 2 * piece + 2].typeClass == clas && arr[i + 3 * piece + 3].typeClass == clas && arr[i + 4 * piece + 4].typeClass == clas;
                if (term1 && term2) {
                    this.setData({
                        isWin: true,
                        winTxt: clas + '赢了'
                    })
                    return true;
                }
            }
            // 垂直线
            if (y <= piece - 5 && arr[i].value != 0 && arr[i].typeClass == clas) {
                term1 = arr[i + 1 * piece].value != 0 && arr[i + 2 * piece].value != 0 && arr[i + 3 * piece].value != 0 && arr[i + 4 * piece].value != 0;
                term2 = arr[i + 1 * piece].typeClass == clas && arr[i + 2 * piece].typeClass == clas && arr[i + 3 * piece].typeClass == clas && arr[i + 4 * piece].typeClass == clas;
                if (term1 && term2) {
                    this.setData({
                        isWin: true,
                        winTxt: clas + '赢了'
                    })
                    return true;
                }
            }
            // 右上斜线
            if (x >= 4 && y <= piece - 5 && arr[i].value != 0 && arr[i].typeClass == clas) {
                term1 = arr[i + 1 * piece - 1].value != 0 && arr[i + 2 * piece - 2].value != 0 && arr[i + 3 * piece - 3].value != 0 && arr[i + 4 * piece - 4].value != 0;
                term2 = arr[i + 1 * piece - 1].typeClass == clas && arr[i + 2 * piece - 2].typeClass == clas && arr[i + 3 * piece - 3].typeClass == clas && arr[i + 4 * piece - 4].typeClass == clas;
                if (term1 && term2) {
                    this.setData({
                        isWin: true,
                        winTxt: clas + '赢了'
                    })
                    return true;
                }
            }
            // 水平线
            if (x <= piece - 5 && arr[i].value != 0 && arr[i].typeClass == clas) {
                term1 = arr[i + 1].value != 0 && arr[i + 2].value != 0 && arr[i + 3].value != 0 && arr[i + 4].value != 0;
                term2 = arr[i + 1].typeClass == clas && arr[i + 2].typeClass == clas && arr[i + 3].typeClass == clas && arr[i + 4].typeClass == clas;
                if (term1 && term2) {
                    this.setData({
                        isWin: true,
                        winTxt: clas + '赢了'
                    })
                    return true;
                }
            }
        }
    },
    // 生成棋子数组
    createPiece() {
        let piece = this.data.piece;
        let pieceArr = [];
        for (let i = 0; i < piece * piece; i++) {
            let item = {};
            item.colId = i;
            item.typeClass = '';
            item.ches = '';
            item.value = 0;
            pieceArr.push(item)
        }
        this.setData({
            pieceArr
        })
    },
    showToast(msg) {
        wx.showToast({
            title: msg,
            icon: 'none'
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    // AI代码
    AiInit() {
        let piece = this.data.piece;
        //初始化棋盘的每个位置和赢法
        for (let x = 0; x < piece; x++) {
            this.allChesses[x] = [];
            this.wins[x] = [];
            for (let y = 0; y < piece; y++) {
                this.allChesses[x][y] = false;
                this.wins[x][y] = [];
            }
        }
        //获取所有赢法
        this.computedWins();
        // 初始化电脑和我每个赢法当前拥有的棋子数
        for (var i = 0; i < this.winsCount; i++) {
            this.myWins[i] = 0;
            this.computerWins[i] = 0;
        }
    },
    // 计算所有赢法
    computedWins() {
        let piece = this.data.piece;
        // 直线赢法 以15列为准
        for (var x = 0; x < piece; x++) { //纵向所有赢法
            for (var y = 0; y < piece - 4; y++) {
                this.winsCount++;
                //以下for循环给每种赢法的位置信息储存起来
                for (var k = 0; k < 5; k++) {
                    this.wins[x][y + k][this.winsCount] = true;
                }
            }
        }
        for (var y = 0; y < piece; y++) { //横向所有赢法, 同纵向赢法一样，也是15 * 11种
            for (var x = 0; x < piece - 4; x++) {
                this.winsCount++;
                for (var k = 0; k < 5; k++) {
                    this.wins[x + k][y][this.winsCount] = true;
                }
            }
        }
        // 交叉赢法
        for (var x = 0; x < piece - 4; x++) { // 左 -> 右 开始的所有交叉赢法  总共11 * 11种
            for (var y = 0; y < piece - 4; y++) {
                this.winsCount++;
                for (var k = 0; k < 5; k++) {
                    this.wins[x + k][y + k][this.winsCount] = true;
                }
            }
        }
        for (var x = piece - 1; x >= 4; x--) { //右 -> 左 开始的所有交叉赢法  总共11 * 11种
            for (var y = 0; y < piece - 4; y++) {
                this.winsCount++;
                for (var k = 0; k < 5; k++) {
                    this.wins[x - k][y + k][this.winsCount] = true;
                }
            }
        }
    },
    // 检查落子情况，判断输赢
    checkChess(v) {
        let piece = this.data.piece;
        let pieceArr = this.data.pieceArr;
        let x = v % piece;
        let y = parseInt(v / piece);
        this.existChesses.push({
            id: Number(v),
            x: x,
            y: y,
            player: this.player
        });
        this.allChesses[x][y] = true; //该位置棋子置为true,证明已经存在
        let currObj = this.player ? this.myWins : this.computerWins;
        let enemyObj = this.player ? this.computerWins : this.myWins;
        let currText = this.player ? '你' : 'AI机器人';
        for (let i = 1; i <= this.winsCount; i++) {
            pieceArr[v].ches = '';
            if (i == v) {
                pieceArr[v].ches = 'ches';
                this.setData({
                    pieceArr
                })
            }
            if (this.wins[x][y][i]) { //因为赢法统计是从1开始的  所以对应我的赢法需要减1
                currObj[i - 1]++; // 每个经过这个点的赢法都增加一个棋子;
                enemyObj[i - 1] = 6; //这里我下好棋了,证明电脑不可能在这种赢法上取得胜利了， 置为6就永远不会到5，全是6-和棋

                if (currObj[i - 1] === 5) { //当达到 5 的时候,证明赢了了
                    this.over = true;
                    this.setData({
                        isWin: true,
                        winTxt: currText + '赢了'
                    })
                    return true;
                }
            }
        }
    },
    // AI机器人下棋
    AiRobotPlayChess(id) {
        let piece = this.data.piece;
        let obj = this.computerAI()
        let pieceArr = this.data.pieceArr; // 全部棋子
        let v = parseInt(obj.y * piece) + obj.x;
        pieceArr[v].value = v == 0 ? 0.1 : v;
        pieceArr[v].typeClass = 'white';
        this.setData({
            pieceArr
        })
        this.checkChess(v)
        if (!this.over) {
            this.player = true;
        }
    },
    // AI算法实现-评分，根据分数大小判断得到有利的位置
    computerAI() {
        let piece = this.data.piece;
        let myScore = [], //玩家比分
            computerScore = [], // AI比分
            maxScore = 0; //最大比分
        //比分初始化
        let scoreInit = function () {
            for (let x = 0; x < piece; x++) {
                myScore[x] = [];
                computerScore[x] = [];
                for (let y = 0; y < piece; y++) {
                    myScore[x][y] = 0;
                    computerScore[x][y] = 0;
                }
            }
        }
        scoreInit.call(this);
        //AI机器人待会落子的坐标
        let x = 0,
            y = 0;
        // 基于我和AI机器人的每种赢法拥有的棋子来返回对应的分数
        function formatScore(o, n) {
            if (o < 6 && o > 0) {
                let n = 10;
                for (let i = 0; i < o; i++) {
                    n *= 3;
                }
                return n
            }
            return 0
        }
        // 获取没有落子的棋盘区域
        function existChess(arr) {
            let existArr = [];
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].length; j++) {
                    if (!arr[i][j]) {
                        existArr.push({
                            x: i,
                            y: j
                        })
                    }
                }
            }
            return existArr;
        }
        let exceptArr = existChess(this.allChesses);
        // 循环未落子区域，找出分数最大的位置
        for (let i = 0; i < exceptArr.length; i++) {
            let o = exceptArr[i];
            // 循环所有赢的方法
            for (let k = 0; k < this.winsCount; k++) {
                //判断每个坐标对应的赢法是否存在
                if (this.wins[o.x][o.y][k]) {
                    // 计算每种赢法，拥有多少棋子，获取对应分数
                    // AI机器人起始分数需要高一些，因为现在是AI机器人落子， 优先权大
                    myScore[o.x][o.y] += formatScore(this.myWins[k - 1], 10);
                    computerScore[o.x][o.y] += formatScore(this.computerWins[k - 1], 11);
                }
            }
            //我的分数判断
            if (myScore[o.x][o.y] > maxScore) { //当我的分数大于最大分数时， 证明这个位置的是对我最有利的
                maxScore = myScore[o.x][o.y];
                x = o.x;
                y = o.y;
            } else if (myScore[o.x][o.y] === maxScore) {
                //当我的分数与最大分数一样时， 证明我在这两个位置下的效果一样， 所以我们应该去判断在这两个位置时，AI机器人对应的分数
                if (computerScore[o.x][o.y] > computerScore[x][y]) {
                    x = o.x;
                    y = o.y;
                }
            }
            // AI机器人分数判断， 因为是AI机器人落子， 所以优先权大
            if (computerScore[o.x][o.y] > maxScore) {
                maxScore = computerScore[o.x][o.y];
                x = o.x;
                y = o.y;
            } else if (computerScore[o.x][o.y] === maxScore) {
                if (myScore[o.x][o.y] > myScore[x][y]) {
                    x = o.x;
                    y = o.y;
                }
            }
        }
console.log(myScore);

        return {
            x: x,
            y: y
        }
    }

})