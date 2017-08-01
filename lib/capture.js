(function($){
  $.fn.webCam = function(){
    var self = this;
    var promisifiedOldGUM = function(constraints) {

        // 第一个拿到getUserMedia，如果存在
        var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia);

        // 有些浏览器只是不实现它-返回一个不被拒绝的承诺与一个错误保持一致的接口
        if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser-getUserMedia是不是在这个浏览器实现'));
        }

        // 否则，调用包在一个旧navigator.getusermedia承诺
        return new Promise(function(resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
        });

    }

    // 旧的浏览器可能无法实现mediadevices可言，所以我们设置一个空的对象第一
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    // 一些浏览器部分实现mediadevices。我们不能只指定一个对象
    // 随着它将覆盖现有的性能getUserMedia。.
    // 在这里，我们就要错过添加getUserMedia财产。.
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
    }

    // Prefer camera resolution nearest to 1280x720.
    var constraints = {
        audio: true,
        video: {
            width: 1280,
            height: 720
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            var video = self[0];
            console.log(self[0]);
            video.src = window.URL.createObjectURL(stream);
            video.onloadedmetadata = function(e) {
                video.play();
            };
        }).catch(function(err) {
            console.log(err.name + ": " + err.message);
        });
  }
  //para = {"output":"#output","density":500}
  $.fn.capture = function(para){
    if(typeof(para.density) == "undefined"){
      para.density = 500;
    }
    if(typeof(para.output) == "undefined"){
      console.log("No output dom.");
      return "error";
    }
   var video, output, self, scale, color = [];
   var K = para.K;
  //  for (var i=0;i<K;i++){
  //    color[i] = [parseInt(Math.random()*255),parseInt(Math.random()*255),parseInt(Math.random()*255)];
  //  }
  color = [[128,0,0],[65,63,128],[128,63,127],[127,128,0],[60,40,222],[255,69,0],[193,193,128],[193, 128, 128]];
   self = this, scale = 0.41;
   var initialize = function() {
       output = $(para.output)[0];
       video = self[0];

       if(self.is("video")){
         setInterval(captureImage,para.density);
       }else if(self.is("img")){
         console.log(true);
         $("#bt-2").click(captureImage);
       }
      // setTimeout(captureImage,1000);
      // captureImage();
      // $("#bt-2").click(captureImage);
       // video.addEventListener('onmouseover',captureImage);
   };

   var captureImage = function() {
    //  console.log(video.width);
       var canvas = document.createElement("canvas");
       if(self.is("video")){
         canvas.width = video.videoWidth * scale;
         canvas.height = video.videoHeight * scale;
       }else if(self.is("img")){
         console.log(video.width,video.height);
         canvas.width = video.width * scale;
         canvas.height = video.height * scale;
       }

       ctx = canvas.getContext('2d');

       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
       // $("#output").append("<div class='block'></div>");
       kmeans(ctx,canvas.width,canvas.height,K);
       var img = document.createElement("img");
       img.src = canvas.toDataURL("image/png");
       // output.appendChild(img);
       $(output).html(img);
   };


   var kmeans = function(ctx, width, height, K){
     var xyrgb = [], centers = [], count = [], imgData, ansImg = [];
    //  centers = [];
     imgData = ctx.getImageData(0,0,width,height);
     for (var i=0;i<K;i++){
       centers[i] = [Math.random(),Math.random(),Math.random(),Math.random(),Math.random()];

     }
    //  console.log(isNaN(centers[1][0]));
     var _minele = function(arr){
       var pos=0,val=9007199254740992;
       for(var i=0;i<arr.length;i++){
         if(arr[pos]>arr[i]){
           pos = i;
         }
       }
       return pos;
     }
     var _rgb_to_hsv = function(r,g,b){
       var h,s,v,Max,Min;
       Max = Math.max(r,g,b);
       Min = Math.min(r,g,b);
       if(Max == Min){
         h = 0;
       }else if(Max == r && g >= b){
         h = 60 * (g - b) / (Max - Min) + 0;
       }else if(Max == r && g < b){
         h = 60 * (g - b) / (Max - Min) + 360;
       }else if(Max == g){
         h = 60 * (b - r) / (Max - Min) + 120;
       }else if(Max == b){
         h = 60 * (r - g) / (Max - Min) + 240;
       }

       if(Max == 0){
         s = 0;
       }
       else{
         s = 1 - (Min - Max);
       }

       v = Max;
       return [h,s,v];
     }
     var dis_1 = function(D,posX,posY){
       //D is for more safe and flaxiable.You should not believe D == posX.length == posY.length
       var dis = 0;
       for(var i=0;i<D;i++){
         dis += Math.abs(posX[i]-posY[i]);
       }
       return dis;
     }
     var dis_2 = function(D,posX,posY){
       //D is for more safe and flaxiable.You should not believe D == posX.length == posY.length
       var dis = 0;
       for(var i=0;i<D;i++){
         dis += (posX[i] - posY[i]) * (posX[i] - posY[i]);
       }
       return dis;
     }
     var dis_n = function(n,D,posX,posY){
       //D is for more safe and flaxiable.You should not believe D == posX.length == posY.length
       var dis = 0;
       for(var i=0;i<D;i++){
         dis += Math.abs(Math.pow(posX[i]-posY[i],n));
       }
       return dis;
     }
     var cross_entropy = function(D,posX,posY){
       var dis = 0;
       for(var i=0;i<D;i++){
         dis -= (posX[i]*Math.log(posY[i]));
       }
       return dis;
     }
    //  console.log(_rgb_to_hsv(211,102,32));
     var hls_dis_2 = function(D, posX, posY){
       var dis = 0, hsv = [];
       hsvX = _rgb_to_hsv(posX[2], posX[3], posX[4]);
       hsvX[0] /= 360;
       hsvY = _rgb_to_hsv(posY[2], posY[3], posY[4]);
       hsvY[0] /= 360;
       for(var i=0;i<3;i++){
         dis += (hsvX[i] - hsvY[i]) * (hsvX[i] - hsvY[i]);
       }
       for(var i=0;i<2;i++){
         dis += (posX[i] - posY[i]) * (posX[i] - posY[i]);
       }
       return dis;
     }
     var dis_methods = {
       "Manhattan":dis_1,
       "Euclid":dis_2,
       "Minkowski":dis_n,
       "CrossEntropy":cross_entropy
     };
     var classify = function(){
       for(var i=0;i<K;i++){
         count[i] = 0;
       }

       for(var i=0;i<height;i++){
         for (var j=0;j<width;j++){
           var dis = [];
           for(var k=0;k<K;k++){
             dis[k] = dis_2(5,centers[k],xyrgb[i][j]);
            // dis[k] = hls_dis_2(5,centers[k],xyrgb[i][j]) ;
           }
          //  console.log(Math.max(dis));
          //  xyrgb[i][j][5] = dis.indexOf(Math.min.apply(null,dis));
           xyrgb[i][j][5] = _minele(dis);
           count[xyrgb[i][j][5]] ++;
         }
       }

     };
     var recenter = function(){
       for(var i=0;i<K;i++){
         centers[i] = [0,0,0,0,0];
       }
       for(var i=0;i<height;i++){
         for(var j=0;j<width;j++){
           for(var d=0;d<5;d++){
             centers[xyrgb[i][j][5]][d] += xyrgb[i][j][d];
           }
         }
       }
       for(var k=0;k<K;k++){
         for(var d=0;d<5;d++){
           if(count[k] == 0){
             count[k] = 1;
           }
           centers[k][d] = centers[k][d]/count[k];
         }
       }
     };

     for(var i=0,imgSize=imgData.data.length; i<imgSize; i+=4){
       var posX = i/4%width;
       var posY = parseInt(i/4/width);
       if(posX == 0){
         xyrgb[posY] = [];
       }
        xyrgb[posY][posX] = [posX/width,posY/height,para.colorWeight*imgData.data[i]/255,para.colorWeight*imgData.data[i+1]/255,para.colorWeight*imgData.data[i+2]/255,0];
     }
     for(var i=0; i<4; i++){
       classify();
       recenter();
     }

     for(var i=0;i<height;i++){
       for(var j=0;j<width;j++){
         var pix = (i*width+j)*4;

         imgData.data[pix] = color[xyrgb[i][j][5]][0];
         imgData.data[pix+1] = color[xyrgb[i][j][5]][1];
         imgData.data[pix+2] = color[xyrgb[i][j][5]][2];
         imgData.data[pix+3] = 255;


       }
     }

     ctx.putImageData(imgData,0,0);
   }
   initialize();
  }

}(jQuery));
