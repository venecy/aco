function paspas_tsp(sites, args) {
    /** 定义：
     *  变量与函数
     */
    var M, N, T = args.loop, SITES = sites,
        ALPHA = args.alpha, BETA = args.beta, RHO = args.rho,
        MAX = 10, MIN = 0.1, Q = 100,
        D = [], tau = [],
        tabus = [], allowed = [], site = [],
        bestAnt, lengthLocal, routineLocal = [], lengthGloble, routineGloble = [],
        p, pathLengthes = [];

    N = SITES.length;
    M = N;
    // 计算两点间距离
    function tp_dist(x, y) {
        return Math.sqrt(Math.pow((SITES[x][0] - SITES[y][0]), 2) + Math.pow((SITES[x][1] - SITES[y][1]), 2));
    }
    // 计算一条路径的长度
    function rout_dist(rout) {
        var len = rout.length;
        if (len < 2) {
            return;
        }
        else {
            var pathLength = 0;
            for (var i = 0; i < len - 1; i++) {
                pathLength += D[rout[i]][rout[i + 1]];
            }
            return pathLength;
        }
    }
    // 计算边（i，j）的eta值
    function eta(i, j) {
        var x = 1 / D[i][j];
        if (isNaN(x)) {
            throw new Error('eta is not a number');
        }
        return x;
    }
    // 转移概率（分子部分）
    function pk(i, j) {
        var x;
        if (i == j) {
            return 0;
        }
        else {
            x = Math.pow(tau[i][j], ALPHA) * Math.pow(eta(i, j), BETA);
            if (isNaN(x)) {
                throw new Error('pk is not a number');
            }
            return x;
        }
    }
    // 数组求和
    function sum(a) {
        var sum = 0;
        for (var i = 0; i < a.length; i++) {
            sum += a[i];
        }
        return sum;
    }
    // 生成一个随机数，返回其在一组区间中的位置（选择下一站点）
    function chose(p) {
        var r = Math.random(), z = 0;
        for (var i = 0; i < p.length; i++) {
            z += p[i];
            if (r < z) {
                return i;
            }
        }
    }
    // 返回数组中最小值的索引
    function select_min(a) {
        var min = a[0], index = 0;
        for (var i = 1; i < a.length; i++) {
            if (min > a[i]) {
                min = a[i];
                index = i;
            }
        }
        return index;
    }
    // 移动蚂蚁k到站点j
    function move_to(ant_k, site_j) {
        site[ant_k] = site_j;
        tabus[ant_k].push(site_j);
        allowed[ant_k][site_j] = false;
    }
    // capacity, travel, giveup, allowed, tabus, site
    function ants_redefine() {
        for (i = 0; i < M; i++) {
            tabus[i] = [];
            allowed[i] = [];
            site[i] = 0;
            for (j = 0; j < N; j++) {
                allowed[i][j] = true;
            }
        }
        // console.log('tabus: ' + tabus);
        // console.log('allowed: ' + allowed);
        // console.log('capacity: ' + capacity);
        // console.log('travel: ' + travel);
        // console.log('giveup: ' + giveup);
        // console.log('site: ' + site);           
    }

    /** 开始：
     *  算法执行
     */
    // 距离矩阵，信息素矩阵初始化
    for (var i = 0; i < N; i++) {
        D[i] = [];
        tau[i] = [];
        for (var j = 0; j < N; j++) {
            D[i][j] = tp_dist(i, j);
            tau[i][j] = MAX;
        }
    }
    // console.log("tau: " + tau);
    // console.log("D: " +D);
    // 初始化禁忌表矩阵等相关数据
    ants_redefine();
    // console.time('time');
    // 主循环
    var p_sum = 0, next_site, n,
        delta_tau = 0, new_tau = 0;

    for (var t = 0; t < T; t++) {
        //console.log('第 ' + t + ' 次循环： ');
        // 随机选择起点 
        for (i = 0; i < M; i++) {
            move_to(i, Math.round(Math.random() * (N - 1)));
        }
        // 构建禁忌表矩阵
        //console.time('tabus');
        for (var ant_k = 0; ant_k < M; ant_k++) {
            n = 1;
            while (n < N) {
                //console.log('n: ' + n);
                // 概率区间列表
                p = (function (ant_k) {
                    var p = [];
                    for (var j = 0; j < N; j++) {
                        if (allowed[ant_k][j]) {
                            p[j] = pk(site[ant_k], j);
                        }
                        else {
                            p[j] = 0;
                        }
                    }
                    if (sum(p) === 0) {
                        throw new Error('p is zero list');
                    }
                    else if (isNaN(sum(p))) {
                        throw new Error('sum p is not a number');
                    }
                    return p;
                })(ant_k);
                p_sum = sum(p);
                //console.log(' p_sum: ' + p_sum)
                for (i = 0; i < p.length; i++) {
                    p[i] /= p_sum;
                }
                // 随机选择区间
                next_site = chose(p);
                //console.log(' after sum: ' + p);
                move_to(ant_k, next_site);
                // 循环
                n += 1;
            }
        }
        //console.log('n: ' + n);
        //console.timeEnd('tabus');
        // (function tabus_info() {
        //     for (var i = 0; i < M; i++) {
        //         console.log('[' + tabus[i] + ']');
        //     }
        // })();
        // 计算循环最短路径
        for (ant_k = 0; ant_k < M; ant_k++) {
            pathLengthes[ant_k] = rout_dist(tabus[ant_k]);
        }
        bestAnt = select_min(pathLengthes);
        lengthLocal = pathLengthes[bestAnt];
        routineLocal = tabus[bestAnt];
        //console.log('lengthLocal: ' + lengthLocal);
        // console.log('routineLocal: ' + routineLocal);
        // 更新全局最短路径
        if (lengthLocal < lengthGloble || lengthGloble === undefined) {
            lengthGloble = lengthLocal;
            routineGloble = routineLocal;
        }
        // 更新信息素        
        for (i = 0; i < N; i++) {
            for (var j = 0; j < N; j++) {
                new_tau = tau[i][j] * RHO;
                // 信息素强度应大于MIN
                if (new_tau < MIN) {
                    tau[i][j] = MIN;
                }
                else {
                    tau[i][j] = new_tau;
                }
            }
        }
        delta_tau = Q / lengthLocal; // 信息素增量
        for (var site_i = 0; site_i < routineLocal.length - 2; site_i++) {
            new_tau = tau[routineLocal[site_i]][routineLocal[site_i + 1]] + delta_tau;
            // 信息素强度应小于MAX
            if (new_tau > MAX) {
                tau[routineLocal[site_i]][routineLocal[site_i + 1]] = MAX;
            }
            else {
                tau[routineLocal[site_i]][routineLocal[site_i + 1]] = new_tau;
            }
        }
        // 重置禁忌表矩阵，allowed矩阵
        ants_redefine();
    }
    // console.timeEnd('time');
    // 返回结果
    return {
        path: lengthGloble,
        routine: routineGloble
    };
}
exports.run = paspas_tsp;
exports.name = "paspas_tsp";