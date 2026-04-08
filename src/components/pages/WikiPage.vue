<template>
  <div class="page active">
      <div style="text-align:center;margin-bottom:25px"><h2>📖 农耕小百科</h2></div>
      <div class="card">
          <div class="plant-grid">
              <div><img src="https://img0.baidu.com/it/u=1212121212,3434343434&fm=253&fmt=auto" class="plant-img"><br>番茄</div>
              <div><img src="https://img1.baidu.com/it/u=5656565656,7878787878&fm=253&fmt=auto" class="plant-img"><br>黄瓜</div>
              <div><img src="https://img2.baidu.com/it/u=9090909090,1212121212&fm=253&fmt=auto" class="plant-img"><br>茄子</div>
              <div><img src="https://img0.baidu.com/it/u=3434343434,5656565656&fm=253&fmt=auto" class="plant-img"><br>菠菜</div>
              <div><img src="https://img1.baidu.com/it/u=7878787878,9090909090&fm=253&fmt=auto" class="plant-img"><br>苹果</div>
              <div><img src="https://img2.baidu.com/it/u=1212121212,3434343434&fm=253&fmt=auto" class="plant-img"><br>香蕉</div>
          </div>
          <p style="font-size:18px;text-align:center;margin-top:20px">
              中国拥有悠久的农耕文化，我们种植了上千种粮食、蔬菜和水果，<br>
              珍惜粮食，爱护自然，是每个小农夫的责任！
          </p>
      </div>
  </div>
</template>
<style scoped>
.page { display: block; animation: fadeIn 0.4s;}
.card { background: white; border-radius: 15px; padding: 35px; border: 3px solid #FFF3E0; box-shadow: 0 5px 12px rgba(0,0,0,0.05); }
.plant-img { width: 100px; height: 100px; object-fit: contain; margin: 10px; transition: 0.3s; }
.plant-img:hover { transform: scale(1.1); }
.plant-grid { display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; margin: 20px 0; text-align: center; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>