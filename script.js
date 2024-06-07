function dongho()   {
    var time = new Date();
    var gio = time.getHours();
    var phut = time.getMinutes();
    var giay = time.getSeconds();
    if (gio < 10)
        gio = "0" + gio;
    if (phut < 10)
        phut = "0" + phut;
    if (giay < 10)
        giay = "0" + giay;
    document.getElementById("time").innerHTML = "Viet Nam (GMT+7) " + gio + ":" + phut + ":" + giay;
    setTimeout("dongho()", 1000);
  }; 
  function ClickHome() {
    var roomElements = document.getElementsByClassName('room');
    document.getElementById('bgr_img').style.backgroundImage = "url('img/nendieukhien.jpg')";
    // Ẩn tất cả các phần tử có class 'room'
    for (var i = 0; i < roomElements.length; i++) {
      roomElements[i].style.display = 'none';
    }
    // Hiển thị phòng living-room
    var livingRoomElement = document.getElementById('home-page');
    livingRoomElement.style.display = 'block';
  }
  function ClickTable() {
    var roomElements = document.getElementsByClassName('room');
    // Ẩn tất cả các phần tử có class 'room'
    for (var i = 0; i < roomElements.length; i++) {
      roomElements[i].style.display = 'none';
    }
    // Hiển thị phòng bedroom
    var bedRoomElement = document.getElementById('bedroom');
    bedRoomElement.style.display = 'block';
  }
  function ClickVD() {
    document.getElementById('bgr_img').style.backgroundImage = 'none';

    var roomElements = document.getElementsByClassName('room');
    
    // Ẩn tất cả các phần tử có class 'room'
    for (var i = 0; i < roomElements.length; i++) {
      roomElements[i].style.display = 'none';
    }
    // Hiển thị Visualize Data
    var visualizeRoomElement = document.getElementById('visualize data');
    visualizeRoomElement.style.display = 'block';
  }
  
  const firebaseConfig = {
    apiKey: "AIzaSyBWfuLCmEY65-V1aKIO5ws9j8zp2S7xDiI",
    authDomain: "smart-home-iot-5c4de.firebaseapp.com",
    databaseURL: "https://smart-home-iot-5c4de-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-home-iot-5c4de",
    storageBucket: "smart-home-iot-5c4de.appspot.com",
    messagingSenderId: "129455497192",
    appId: "1:129455497192:web:12cf5e59c6d9699dd90e5d"
  };
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  
  var nhietdoPK = document.getElementById('TemperatureLivingRoom');
  var dbReftempPK = firebase.database().ref().child('Living room/Nhiệt độ');
  var doamPK = document.getElementById('HumidityLivingRoom');
  var dbRefhumiPK = firebase.database().ref().child('Living room/Độ ẩm');
  var gasPK = document.getElementById('GasLivingRoom');
  var dbRefgasPK = firebase.database().ref().child('Living room/Gas');

  var dbRefStateAirConditionLivingRoom = firebase.database().ref().child('Living room/Điều hòa');
  var dbRefStateLampLivingRoom = firebase.database().ref().child('Living room/Đèn');

  var StateAirConditionLivingRoom = "0";
  var StateLampLivingRoom = "0";

  var wateringTimes = [];

  // Đọc dữ liệu từ Local Storage
  try {
    var storedData = localStorage.getItem('wateringData');
    if (storedData) {
      wateringTimes = JSON.parse(storedData); // Gán dữ liệu lưu trữ vào mảng wateringTimes
    }
  } catch (error) {
    console.error("Đọc dữ liệu từ Local Storage thất bại:", error);
  }
  
  dbReftempPK.on('value', snap => nhietdoPK.innerText = snap.val());
  dbRefhumiPK.on('value', snap => doamPK.innerText = snap.val());
  dbRefgasPK.on('value', snap => gasPK.innerText = snap.val());


  //Lấy dữ liệu thời gian thực từ Firebase
  function sync_Firebase() 
  {
    //Lấy dữ liệu nút Switch (điều hòa Livingroom)
    dbRefStateAirConditionLivingRoom.on('value', function(snapshot) 
    {
        StateAirConditionLivingRoom = snapshot.val();
        console.log(StateAirConditionLivingRoom);

        if (StateAirConditionLivingRoom == "1") 
        {
            onManual();
        } 
        else 
        {
            onAuto();
        }
    }, function(error) 
    {
        console.error('Error listening for changes in Firebase:', error);
    });

    //Lấy dữ liệu bơm nước (đèn living room)
    dbRefStateLampLivingRoom.on('value', function(snapshot) 
    {
      StateLampLivingRoom = snapshot.val();
      console.log(StateLampLivingRoom);

      if (StateLampLivingRoom == "1") 
      {
          onBom();

      } 
      else 
      {
        offBom();
      }
  }, function(error) 
  {
     console.error('Error listening for changes in Firebase:', error);
  });  
}



function onManual() {
    StateAirConditionLivingRoom = "1";
    dbRefStateAirConditionLivingRoom.set(StateAirConditionLivingRoom)
        .then(function () {
            console.log("Cập nhật giá trị thành công!");
        })
        .catch(function (error) {
            console.error("Cập nhật giá trị thất bại:", error);
        });
    document.getElementById('switch').src = "img/manual.png";
    document.getElementById('on_manual').classList.add("active");
    document.getElementById('on_auto').classList.remove("active");
    enableBomControl();
}

function onAuto() {
    StateAirConditionLivingRoom = "0";
    dbRefStateAirConditionLivingRoom.set(StateAirConditionLivingRoom)
        .then(function () {
            console.log("Cập nhật giá trị thành công!");
        })
        .catch(function (error) {
            console.error("Cập nhật giá trị thất bại:", error);
        });
    document.getElementById('switch').src = "img/auto.png";
    document.getElementById('on_manual').classList.remove("active");
    document.getElementById('on_auto').classList.add("active");
    disableBomControl();
}

function enableBomControl() {
  var bomButton = document.getElementById('onbom');
  bomButton.classList.remove("disabled");
  bomButton.onclick = function() {
      onBom();
  };
}

function disableBomControl() {
  var bomButton = document.getElementById('onbom');
  bomButton.classList.add("disabled");
  bomButton.onclick = null;
}


function onBom() {

  StateLampLivingRoom = "1";
  dbRefStateLampLivingRoom.set(StateLampLivingRoom)
    .then(function() {
      console.log("Cập nhật giá trị thành công!");
    })
    .catch(function(error) {
      console.error("Cập nhật giá trị thất bại:", error);
    });

  document.getElementById('bom').src = "img/bom_on.png";
  document.getElementById('onbom').classList.add("active");
  var currentTime = new Date();
  wateringTimes.push(currentTime);
  // Kiểm tra nếu mảng có nhiều hơn 10 phần tử, loại bỏ phần tử cũ nhất
  if (wateringTimes.length > 10) {
    wateringTimes.shift();
  }
  updateWateringTable();// Lưu trữ dữ liệu vào Local Storage
  try {
    localStorage.setItem('wateringData', JSON.stringify(wateringTimes));
    console.log("Lưu trữ dữ liệu thành công!");
  } catch (error) {
    console.error("Lưu trữ dữ liệu thất bại:", error);
  }

}

function updateWateringTable() {
  var tableBody = document.getElementById('watering_table_body');
  tableBody.innerHTML = '';

  for (var i = 0; i < wateringTimes.length; i++) {
    var row = document.createElement('tr');

    var timeCell = document.createElement('td');
    var formattedTime = moment(wateringTimes[i]).format('YYYY-MM-DD HH:mm:ss');
    timeCell.textContent = formattedTime;
    row.appendChild(timeCell);

    tableBody.appendChild(row);
  }
}

function offBom() {
  StateLampLivingRoom = "0";
  dbRefStateLampLivingRoom.set(StateLampLivingRoom)
    .then(function() {
      console.log("Cập nhật giá trị thành công!");
    })
    .catch(function(error) {
      console.error("Cập nhật giá trị thất bại:", error);
    });
  document.getElementById('bom').src = "img/bom_off.png";
  document.getElementById('onbom').classList.remove("active");
}
/*-------------------------------------------------------------------------------------------*/
// Lấy tất cả các nút tab
const topnavButtons = document.querySelectorAll(".topnav button");

// Lặp qua từng nút tab
topnavButtons.forEach((button) => {
    button.addEventListener("click", function () {
        // Loại bỏ lớp "active" từ tất cả các nút tab
        topnavButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        // Thêm lớp "active" cho nút tab đang được chọn
        button.classList.add("active");
    });
});


// Hiển thị biểu đồ Livingroom
var temperatureDataPK = [];
var humidityDataPK = [];
var gasDataPK = [];
var timeLabelsPK = [];

// Sử dụng mảng thời gian làm nhãn cho biểu đồ
var ctxPK = document.getElementById('LivingroomChart').getContext('2d');
var dataPK = {
  labels: timeLabelsPK,
  datasets: [
    {
      label: 'Nhiệt độ',
      data: temperatureDataPK,
      borderColor: 'red',
      borderWidth: 2,
      fill: false,
    },
    {
      label: 'Độ ẩm',
      data: humidityDataPK,
      borderColor: 'blue',
      borderWidth: 2,
      fill: false,
    },
    {
      label: 'Độ ẩm đất',
      data: gasDataPK,
      borderColor: 'green',
      borderWidth: 2,
      fill: false,
    },
  ],
};

// Hàm cập nhật biểu đồ
function updateChartPK() {
  LivingroomChart.update();
}

// Lắng nghe dữ liệu từ Firebase và cập nhật biểu đồ
dbReftempPK.on('value', (snapshot) => {
  const time = new Date().toLocaleTimeString();
  timeLabelsPK.push(time);
  temperatureDataPK.push(snapshot.val());
  if (temperatureDataPK.length > 10) {
    temperatureDataPK.shift();
    timeLabelsPK.shift();
  }
  updateChartPK();
});

dbRefhumiPK.on('value', (snapshot) => {
  humidityDataPK.push(snapshot.val());
  if (humidityDataPK.length > 10) {
    humidityDataPK.shift();
  }
  updateChartPK();
});
dbRefgasPK.on('value', (snapshot) => {
  gasDataPK.push(snapshot.val());
  if (gasDataPK.length > 10) {
    gasDataPK.shift();
  }
  updateChartPK();
});

// Cấu hình biểu đồ
const optionsPK = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Biểu đồ nhiệt độ - độ ẩm - độ ẩm đất',
      },
      
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Giá trị',
      },
    },
  },
};

const LivingroomChart = new Chart(ctxPK, {
  type: 'line',
  data: dataPK,
  options: optionsPK,
});

const taskbarButtons = document.querySelectorAll(".taskbar button");
const chartContainers = document.querySelectorAll(".chart-container canvas");

