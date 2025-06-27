<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نمودارهای زنده</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .controls {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
        }
        
        .btn-danger {
            background: linear-gradient(45deg, #f44336, #d32f2f);
            color: white;
        }
        
        .btn-info {
            background: linear-gradient(45deg, #2196F3, #1976D2);
            color: white;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .chart-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .chart-title {
            text-align: center;
            color: #333;
            margin-bottom: 15px;
            font-size: 1.2rem;
            font-weight: bold;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #333;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9rem;
            margin-top: 5px;
        }
        
        .status {
            text-align: center;
            color: white;
            margin-bottom: 20px;
            font-size: 1.1rem;
        }
        
        .status.active {
            color: #4CAF50;
        }
        
        .status.inactive {
            color: #f44336;
        }
        
        @media (max-width: 768px) {
            .charts-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .controls {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 نمودارهای زنده</h1>
            <p>نمایش داده‌های لحظه‌ای با انیمیشن</p>
        </div>
        
        <div class="controls">
            <button class="btn btn-primary" id="startBtn">▶️ شروع</button>
            <button class="btn btn-danger" id="stopBtn">⏹️ توقف</button>
            <button class="btn btn-info" id="resetBtn">🔄 بازنشانی</button>
        </div>
        
        <div class="status" id="status">⏸️ آماده برای شروع</div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value" id="dataCount">0</div>
                <div class="stat-label">نقطه داده</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="updateRate">1</div>
                <div class="stat-label">بروزرسانی/ثانیه</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="avgValue">0</div>
                <div class="stat-label">میانگین</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="maxValue">0</div>
                <div class="stat-label">حداکثر</div>
            </div>
        </div>
        
        <div class="charts-grid">
            <div class="chart-container">
                <div class="chart-title">📈 نمودار خطی زنده</div>
                <canvas id="lineChart"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">📊 نمودار میله‌ای</div>
                <canvas id="barChart"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">🥧 نمودار دایره‌ای</div>
                <canvas id="pieChart"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">📉 نمودار ناحیه‌ای</div>
                <canvas id="areaChart"></canvas>
            </div>
        </div>
    </div>

    <script>
        // تنظیمات اصلی
        let isRunning = false;
        let dataPoints = [];
        let maxDataPoints = 20;
        let updateInterval;
        let charts = {};
        
        // آرایه رنگ‌ها
        const colors = [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
        ];
        
        // تولید داده تصادفی
        function generateRandomData() {
            return Math.floor(Math.random() * 100) + 1;
        }
        
        // ایجاد نمودار خطی
        function createLineChart() {
            const ctx = document.getElementById('lineChart').getContext('2d');
            charts.line = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'داده‌های زنده',
                        data: [],
                        borderColor: colors[0],
                        backgroundColor: colors[0].replace('0.8', '0.2'),
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 500,
                        easing: 'easeInOutQuart'
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    }
                }
            });
        }
        
        // ایجاد نمودار میله‌ای
        function createBarChart() {
            const ctx = document.getElementById('barChart').getContext('2d');
            charts.bar = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['A', 'B', 'C', 'D', 'E'],
                    datasets: [{
                        label: 'مقادیر',
                        data: [0, 0, 0, 0, 0],
                        backgroundColor: colors.slice(0, 5),
                        borderColor: colors.slice(0, 5).map(color => color.replace('0.8', '1')),
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 800,
                        easing: 'easeOutBounce'
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
        
        // ایجاد نمودار دایره‌ای
        function createPieChart() {
            const ctx = document.getElementById('pieChart').getContext('2d');
            charts.pie = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['بخش 1', 'بخش 2', 'بخش 3', 'بخش 4', 'بخش 5'],
                    datasets: [{
                        data: [20, 20, 20, 20, 20],
                        backgroundColor: colors.slice(0, 5),
                        borderColor: '#fff',
                        borderWidth: 3,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        animateRotate: true,
                        duration: 1000
                    },
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        // ایجاد نمودار ناحیه‌ای
        function createAreaChart() {
            const ctx = document.getElementById('areaChart').getContext('2d');
            charts.area = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'سری 1',
                        data: [],
                        borderColor: colors[1],
                        backgroundColor: colors[1].replace('0.8', '0.3'),
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'سری 2',
                        data: [],
                        borderColor: colors[2],
                        backgroundColor: colors[2].replace('0.8', '0.3'),
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 600
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            stacked: false
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
        }
        
        // بروزرسانی داده‌ها
        function updateData() {
            const timestamp = new Date().toLocaleTimeString('fa-IR');
            const newValue = generateRandomData();
            
            // بروزرسانی نمودار خطی
            if (charts.line.data.labels.length >= maxDataPoints) {
                charts.line.data.labels.shift();
                charts.line.data.datasets[0].data.shift();
            }
            charts.line.data.labels.push(timestamp);
            charts.line.data.datasets[0].data.push(newValue);
            charts.line.update('none');
            
            // بروزرسانی نمودار میله‌ای
            charts.bar.data.datasets[0].data = charts.bar.data.datasets[0].data.map(() => generateRandomData());
            charts.bar.update();
            
            // بروزرسانی نمودار دایره‌ای
            charts.pie.data.datasets[0].data = charts.pie.data.datasets[0].data.map(() => generateRandomData());
            charts.pie.update();
            
            // بروزرسانی نمودار ناحیه‌ای
            if (charts.area.data.labels.length >= maxDataPoints) {
                charts.area.data.labels.shift();
                charts.area.data.datasets[0].data.shift();
                charts.area.data.datasets[1].data.shift();
            }
            charts.area.data.labels.push(timestamp);
            charts.area.data.datasets[0].data.push(generateRandomData());
            charts.area.data.datasets[1].data.push(generateRandomData());
            charts.area.update('none');
            
            // بروزرسانی آمار
            dataPoints.push(newValue);
            if (dataPoints.length > maxDataPoints) {
                dataPoints.shift();
            }
            
            updateStats();
        }
        
        // بروزرسانی آمار
        function updateStats() {
            document.getElementById('dataCount').textContent = dataPoints.length;
            
            if (dataPoints.length > 0) {
                const avg = Math.round(dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length);
                const max = Math.max(...dataPoints);
                
                document.getElementById('avgValue').textContent = avg;
                document.getElementById('maxValue').textContent = max;
            }
        }
        
        // شروع بروزرسانی
        function startUpdating() {
            if (!isRunning) {
                isRunning = true;
                updateInterval = setInterval(updateData, 1000);
                document.getElementById('status').textContent = '🟢 در حال اجرا...';
                document.getElementById('status').className = 'status active';
                document.getElementById('startBtn').disabled = true;
                document.getElementById('stopBtn').disabled = false;
            }
        }
        
        // توقف بروزرسانی
        function stopUpdating() {
            if (isRunning) {
                isRunning = false;
                clearInterval(updateInterval);
                document.getElementById('status').textContent = '🔴 متوقف شده';
                document.getElementById('status').className = 'status inactive';
                document.getElementById('startBtn').disabled = false;
                document.getElementById('stopBtn').disabled = true;
            }
        }
        
        // بازنشانی داده‌ها
        function resetData() {
            stopUpdating();
            dataPoints = [];
            
            // پاک کردن همه نمودارها
            Object.values(charts).forEach(chart => {
                if (chart.data.labels) {
                    chart.data.labels.length = 0;
                }
                chart.data.datasets.forEach(dataset => {
                    dataset.data.length = 0;
                });
                chart.update();
            });
            
            // بازنشانی نمودار میله‌ای و دایره‌ای
            charts.bar.data.datasets[0].data = [0, 0, 0, 0, 0];
            charts.pie.data.datasets[0].data = [20, 20, 20, 20, 20];
            charts.bar.update();
            charts.pie.update();
            
            // بازنشانی آمار
            document.getElementById('dataCount').textContent = '0';
            document.getElementById('avgValue').textContent = '0';
            document.getElementById('maxValue').textContent = '0';
            document.getElementById('status').textContent = '⏸️ آماده برای شروع';
            document.getElementById('status').className = 'status';
        }
        
        // رویدادها
        document.getElementById('startBtn').addEventListener('click', startUpdating);
        document.getElementById('stopBtn').addEventListener('click', stopUpdating);
        document.getElementById('resetBtn').addEventListener('click', resetData);
        
        // راه‌اندازی اولیه
        window.addEventListener('load', function() {
            createLineChart();
            createBarChart();
            createPieChart();
            createAreaChart();
            
            // غیرفعال کردن دکمه توقف در ابتدا
            document.getElementById('stopBtn').disabled = true;
        });
    </script>
</body>
</html>
