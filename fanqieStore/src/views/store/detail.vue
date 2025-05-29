<script setup lang="ts">
import {ref, computed, onMounted, reactive} from 'vue';
import {ElMessage, UploadProps} from 'element-plus';
import {Search, BellFilled, ShoppingCart, Plus, ShoppingCartFull, Delete} from '@element-plus/icons-vue'
import {addProduct, getProductInfo, getSpecificProduct} from "@/api/product";
import {addAdvertisement, deleteAdvertisement, getAdvertisement, updateAdvertisement} from "@/api/advertisement";
import { useRouter } from 'vue-router';
import {addBookToCart, deleteCart, getCart} from "@/api/cart";
import {getUserDetail} from "@/api/accounts";

const router = useRouter();

// 获得用户信息
const username = String(sessionStorage.getItem('username'));
const userRole = ref("")
const userAvatar = ref("");

// 购物车提交窗口是否可见
const centerDialogVisible1 = ref(false);
// 创建商品窗口是否可见
const centerDialogVisible2 = ref(false);
// 创建广告窗口是否可见
const centerDialogVisible3 = ref(false);
// 修改广告窗口是否可见
const centerDialogVisible4 = ref(false);

// 获得商品模块
interface ProductVO {
  id: number,
  title: string,
  price: number,
  rate: number,
  description: string,
  cover: string,
  detail: string,
  specifications: Specification[];
  stockpile: Stockpile;
}

interface Specification {
  id: number,
  item: string,
  value: string,
  product_id: number;
}
interface Stockpile {
  id: number;
  product_id: number;
  amount: number;
  frozen: number;
}

// 已有的bookList
const bookList = ref<ProductVO[]>([]);

// 创建的book信息
interface CreateProductVO {
  title: string,
  price: number,
  rate: number,
  description: string,
  cover: string,
  detail: string,
  specifications: Specifications[];
}

interface Specifications {
  item: string,
  value: string,
}

const author = ref<string>('')
const subtitle = ref<string>('')
const ISBN = ref<string>('')
const bindingAndLayout = ref<string>('')// 装帧
const pages = ref<string>('')
const publishingHouse = ref<string>('')
const publicationDate = ref<string>('')

const bookInfo = reactive<CreateProductVO>({
  title: '',
  price: 0,
  rate: 0,
  description: '',
  cover: '',
  detail: '',
  specifications: [],
})
// 添加规格
const addSpecification = (Item: string, Value: string) => {
  bookInfo.specifications.push({
    item: Item,
    value: Value,
  });
}

// 已有的广告模块
interface Advertisement {
  id: number,
  title: string,
  content: string,
  imageUrl: string,
  productId: string,
}
// 已有的广告
const advertisementList = ref<Advertisement[]>([]);

// 创建广告的接口
interface CreateAdvertisement {
  title: string,
  content: string,
  imgUrl: string,
  productId: string,
}
// 创建的广告
const createAdvertisementInfo = reactive<CreateAdvertisement> ({
  title: '',
  content: '',
  imgUrl: '',
  productId: '',
})

// 更新广告的接口
interface UpdateAdvertisement {
  id: number,
  title: string,
  content: string,
  imgUrl: string,
  productId: string,
}

// 更新广告的信息
const updateAdvertisementInfo = reactive<UpdateAdvertisement>({
  id: 0,
  title: '',
  content: '',
  imgUrl: '',
  productId: '',
})

// 购物车的书籍信息
interface CartItems {
  cartItemId: number,
  productId: number,
  title: string,
  price: number,
  description: string,
  cover: string,
  detail: string,
  quantity: number,
}

interface CartInfo {
  cartItemVOList: CartItems[],
  total: number,
  totalAmount: number,
}

const cartData = ref<CartInfo>({
  cartItemVOList: [],
  total: 0,
  totalAmount: 0,
});

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    getUserDetail(username).then((res) => {
      console.log("user detail:",res.data.data);
      userRole.value = res.data.data.role;
      userAvatar.value = res.data.data.avatar;
    });
  }catch (error) {
    console.error("获取用户信息失败！", error);
  }
}

// 获取已有书籍列表
const fetchBookList = async () => {
  try {
    getProductInfo().then((res) => {
          console.log("book res:", res);
          console.log("book res.data:", res.data);
          bookList.value = res.data.data;
        });
  }catch(error){
    console.error("书籍列表获取失败！", error);
  }
};

// 获取购物车（内涵商品信息、分别购买数量、总数目和总价）
const fetchCart = async () => {
  try {
    getCart().then((res) => {
        console.log("cart res:", res);
        console.log("cart res.data:", res.data);
        cartData.value = res.data.data;
      });
  } catch (error) {
    console.error('获取购物车失败！', error);
  }
};

// 获取广告
const fetchAdvertisement = async () => {
  try {
    getAdvertisement().then((res) => {
      console.log("advertisement res:", res);
      console.log("advertisement res.data:", res.data);
      advertisementList.value = res.data.data;
    });
  }catch(error){
    ElMessage.error('广告获取失败，请稍后再试！');
  }
};

// 计算购物车内商品总价
const sumPrice = computed(() => {
  const total = cartData.value.cartItemVOList.reduce((accumulator, currentItem) => {
    return accumulator + currentItem.price * currentItem.quantity;
  }, 0);

  // 更新购物车的 total 和 totalAmount
  cartData.value.total = total;
  cartData.value.totalAmount = cartData.value.cartItemVOList.length;

  return total;
});

// 搜索模块
const searchInput = ref('');
function clickSearch(){
  try {
    getSpecificProduct(Number(searchInput.value)).then((res) => {
      // 此处应该修改，先确定有没有该书籍
      if(res.data == null){
        ElMessage.error('该书籍不存在！');
      }else{
        router.push('/book-detail/' + searchInput.value);
      }
      searchInput.value = '';
    })
  }catch (error) {
    ElMessage.error('该书籍不存在！');
  }
}

// 添加商品模块
function addBook() {
  ElMessage.success('添加商品按钮已点击！');
  // 处理specifications部分
  addSpecification('作者', author.value);
  addSpecification('副标题', subtitle.value);
  addSpecification('ISBN', ISBN.value);
  addSpecification('装帧', bindingAndLayout.value);
  addSpecification('页数', pages.value);
  addSpecification('出版社', publishingHouse.value);
  addSpecification('出版日期', publicationDate.value);
  try {
    addProduct(bookInfo).then((res) => {
      if (res.data.code === '000') {  //类型守卫，它检查 res.data 对象中是否存在名为 code 的属性
        ElMessage({
          message: "创建成功！",
          type: 'success',
          center: true,
        })
      } else if (res.data.code === '400') {
        ElMessage({
          message: res.data.msg,
          type: 'error',
          center: true,
        })
      }
      centerDialogVisible2.value = false;
    })
  } catch (error) {
    ElMessage.error('添加商品失败！');
  }
  centerDialogVisible2.value = false;
}

// 添加广告模块
function createAdvertisement(){
  ElMessage.success('添加广告按钮已点击！');
  try {
    addAdvertisement(createAdvertisementInfo).then(res => {
      if (res.data.code === '000') {  //类型守卫，它检查 res.data 对象中是否存在名为 code 的属性
        ElMessage({
          message: "创建成功！",
          type: 'success',
          center: true,
        })
      } else if (res.data.code === '400') {
        ElMessage({
          message: res.data.msg,
          type: 'error',
          center: true,
        })
      }
      centerDialogVisible3.value = false;
    })
  } catch(error){
    ElMessage.error('添加广告失败！');
  }
  centerDialogVisible3.value = false;
}

// 删除广告模块
function deleteThisAdvertisement(id: number) {
  try {
    console.log("正在删除：", id);
    deleteAdvertisement(id).then((res) => {
      if (res.data.code === '000') {  //类型守卫，它检查 res.data 对象中是否存在名为 code 的属性
        ElMessage({
          message: "删除成功！",
          type: 'success',
          center: true,
        })
      } else if (res.data.code === '400') {
        ElMessage({
          message: res.data.msg,
          type: 'error',
          center: true,
        })
      }
    })
  } catch (error){
    ElMessage.error('删除失败');
  }
}

// 点击广告以修改广告
function clickAdvertisement(id: number) {
  updateAdvertisementInfo.id = id;
  centerDialogVisible4.value = true;
  const formattedMessage = `正在修改广告位： ${id}`;
  ElMessage.success(formattedMessage);
}

// 点击确定修改广告
function updateAdvertisementClick(){
  ElMessage.success("确定已点击！")
  try{
    updateAdvertisement(updateAdvertisementInfo).then(res => {
      if (res.data.code === '000') {  //类型守卫，它检查 res.data 对象中是否存在名为 code 的属性
        ElMessage({
          message: "修改成功！",
          type: 'success',
          center: true,
        })
      } else if (res.data.code === '400') {
        ElMessage({
          message: res.data.msg,
          type: 'error',
          center: true,
        })
      }
    })
  }catch(error){
    ElMessage.error("修改广告信息失败");
  }
  centerDialogVisible4.value = false;
}

// 点击头像进入更改个人信息
function clickAvatar(){
  ElMessage.success('头像已点击');
}
// 查看个人信息
function clickMessage(){
  ElMessage.success('消息按钮已点击！');
}
// 点击商品下加号触发加入购物车
function clickBuy(bookInformation: ProductVO){
  addBookToCart(bookInformation.id, 1);
  ElMessage.success('已加入购物车！');
}

// 调用支付
function submit(){
  ElMessage.success('结账按钮已点击！');
}

const goToBookDetail = (bookId : number) => {
  router.push('/book-detail/' + bookId);
}

// 购物车删除行
const deleteRow = (cartItemId : number) => {
  try {
    deleteCart(cartItemId).then((res) => {
      if (res.data.code === '000') {  //类型守卫，它检查 res.data 对象中是否存在名为 code 的属性
        ElMessage({
          message: "删除成功！",
          type: 'success',
          center: true,
        })
      } else if (res.data.code === '400') {
        ElMessage({
          message: res.data.msg,
          type: 'error',
          center: true,
        })
      }
    })
  }  catch (error) {
    ElMessage.error("删除失败！");
  }
};

// 处理商品图片上传
const beforeImageUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('头像必须是jpg/jpeg格式!');
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片不应超过2MB!');
    return false;
  }
  customUpload(rawFile);
  return false;
};
function customUpload(file: File){
  // 需要从后端传入工具类
  // uploadFile(file).then((res) => {
  //   handleUploadSuccess(res);
  // }).catch((err) => {
  //   handleUploadError(err);
  // })
}

// 在页面加载时获取所有书籍、广告和购物车
onMounted(() => {
  fetchUserInfo();
  fetchBookList();
  fetchCart();
  fetchAdvertisement();
})
</script>

<template>
  <el-container>
    <el-aside width="300px" style="background-color: #565656">
      <el-card style="width: 100%; height: 80px; background-color: #2e2d2e; border: 0px solid black;">
        <div class="card-header">
          <span class="title" style="color: white; font-weight: bold;font-size: x-large;margin-left: 10px;margin-top: 1px">番茄书城</span>
        </div>
      </el-card>
      <div style="margin-left: 10px;margin-right: 10px;margin-top: 20px">
        <div style="display:flex">
          <!--购物车模块-->
          <el-icon style="vertical-align: middle; height:25px; color: white">
            <shopping-cart/>
          </el-icon>
          <div style="color: white; font-weight: bold; margin-left: 10px">购物车</div>
        </div>
        <el-table :data="cartData.cartItemVOList" style="width: 100%; margin-top: 20px;" max-height="500" class="transparent-table">
          <el-table-column prop="title" label="名称" width="90" />
          <el-table-column prop="price" label="价格" width="70" />
          <el-table-column prop="quantity" label="数量" width="60" />
          <el-table-column prop="remove" label="操作" min-width="60">
            <template #default="scope">
              <el-button
                  link
                  type="primary"
                  size="small"
                  @click.prevent="deleteRow(scope.row.cartItemId)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 20px; margin-left: 10px; color: white">合计: {{sumPrice}}元</div>
        <el-button @click="centerDialogVisible1 = true;" style="color: white; background-color: #2e2d2e; border-color: #2e2d2e; margin-top: 50px; margin-left: 75px; width: 100px">
          结账
        </el-button>
      </div>
    </el-aside>
    <el-container style="display: flex; flex-direction: column">
      <div class="page">
        <el-card>
          <!--卡片首部模块-->
          <template #header>
            <div class="card-header">
              <span class="title" style="font-weight: bold;font-size: large;margin-left: 10px;margin-top: 6px">主页</span>
              <el-input
                  v-model="searchInput"
                  style="max-width: 600px; margin-top: 2px; margin-left: 30%;"
                  placeholder="请输入书籍ID"
              >
                <template #append>
                  <el-button type="primary" class="search" @click="clickSearch">
                    <el-icon style="vertical-align: middle">
                      <Search/>
                    </el-icon>
                  </el-button>
                </template>
              </el-input>
              <el-avatar :size="40" :src="userAvatar" style="margin-left: 50px" @click="clickAvatar"/>
              <img src="https://lab-blue-whale.oss-cn-nanjing.aliyuncs.com/VIP%E6%9C%AA%E7%82%B9%E4%BA%AE%E7%89%88.png" alt="图片描述" style="margin-top: 15px;margin-left: -15px;width: 25px;height: 25px">
              <el-button class="search" @click="clickMessage" style="margin-left: 20px; height: 40px; width: 40px; border-radius: 40%">
                <el-icon style="vertical-align: middle">
                  <BellFilled/>
                </el-icon>
              </el-button>
            </div>
          </template>
          <!--卡片推荐模块-->
          <div style="display: flex">
            <div style="font-weight: bold; font-size: xx-large">今日推荐</div>
            <el-button v-if="userRole=='admin'" @click="centerDialogVisible3 = true;" type="info" style="margin-left: 900px; margin-top: 8px">添加广告</el-button>
          </div>
          <div style="margin-top: 10px">
            <el-carousel :interval="4000" type="card" height="300px">
              <el-carousel-item v-for="item in advertisementList" :key="item.productId" @click="clickAdvertisement(item.id)">
                <div style="height: 100%; width: 100%; display: flex">
                  <div style="width: 50%">
                    <div class="advertisement-book-name" style="height: 35%; width: 90%; margin-top: 20px;margin-left: 20px">{{item.title}}</div>
                    <el-text class="advertisement-book-content" style="margin-left: 20px; width: 80%; height: 115px">{{item.content}}</el-text>
                    <div style="display: flex">
                      <el-button type="warning" disabled style="margin-top: 10px">BUY NOW!</el-button>
                      <el-button type="danger" :icon="Delete" circle style="margin-left: 150px;margin-top: 10px" @click.stop="deleteThisAdvertisement(item.id)"/>
                    </div>
                  </div>
                  <div style="width: 50%">
                    <el-image
                        :src="item.imageUrl"
                        :alt="item.title"
                        fit="cover"
                        style="height: 80%; width: 70%; margin-left: 25px; margin-top: 25px"
                    >
                      <template #error>
                        <div class="image-error">图片加载失败</div>
                      </template>
                    </el-image>
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>
          <div style="margin-top: 70px; height: 60px; display: flex">
            <div style="font-weight: bold; font-size: xx-large">商品列表</div>
            <el-button v-if="userRole=='admin'" @click="centerDialogVisible2 = true;" type="info" style="margin-left: 900px; margin-top: 15px">添加商品</el-button>
          </div>
        </el-card>
      </div>
      <!--      商品列表       -->
      <div style="width: 90%; height: 100%; margin-left: 60px">
        <el-row :gutter="30">
          <el-col
              v-for="book in bookList"
              :key="book.id"
              :xs="24"
              :sm="12"
              :md="6"
              :lg="6"
              :xl="6"
          >
            <el-card @click="goToBookDetail(book.id)" class="book-card" shadow="hover" style="height: 360px; margin-top: 20px">
              <template #header>
                <div class="book-header">
                  <el-image
                      class="book-image"
                      :src="book.cover"
                      :alt="book.title"
                      fit="cover"
                  >
                    <template #error>
                      <div class="image-error">图片加载失败</div>
                    </template>
                  </el-image>
                </div>
              </template>
              <div class="book-name">{{ book.title }}</div>
              <el-rate
                  v-model="book.rate"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value} points"
              />
              <div style="display: flex">
                <div class="book-price">￥{{book.price}}</div>
                <el-button class="buy-button" @click.stop="clickBuy(book)" style="margin-left: 20px; height: 40px; width: 40px; border-radius: 50%">
                  <el-icon style="vertical-align: middle">
                    <Plus />
                  </el-icon>
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-container>
    <el-backtop :right="50" :bottom="50" style="color: #565656"/>
  </el-container>

  <!--购物车提交弹出窗口-->
  <el-dialog v-model="centerDialogVisible1" title="提示" width="500" center>
    <span style="display: flex">
      <el-icon size="large" style="margin-left: 20px;margin-top: 2px"><ShoppingCartFull /></el-icon>
      <div style="margin-left: 15px">你确定要提交账单吗？</div>
    </span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible1 = false">取消</el-button>
        <el-button type="primary" @click="submit">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!--创建商品弹出窗口-->
  <el-dialog v-model="centerDialogVisible2" title="创建商品" width="1000" center>
    <span style="display: flex">
      <div>
        <el-main>
        <el-form :model="bookInfo" label-width="auto" style="margin-top: 10px">
          <div style="display: flex;">
            <el-form-item label="商品名称" style="width: 300px; display: flex">
              <el-input v-model="bookInfo.title" placeholder="请输入商品名称"/>
            </el-form-item>
            <el-form-item label="副标题" style="width: 300px; display: flex">
              <el-input v-model="subtitle" placeholder="请输入副标题"/>
            </el-form-item>
            <el-form-item label="作者" style="width: 300px; display: flex">
              <el-input v-model="author" placeholder="请输入作者名字"/>
            </el-form-item>
          </div>
          <div style="display: flex; margin-top: 25px">
            <el-form-item label="商品价格" style="width: 300px;">
              <el-input v-model="bookInfo.price" placeholder="请输入商品价格（单位：元）"/>
            </el-form-item>
            <el-form-item label="商品评分" style="width: 300px">
              <el-rate v-model="bookInfo.rate" allow-half />
            </el-form-item>
            <el-form-item label="ISBN" style="width: 300px">
              <el-input v-model="ISBN" placeholder="请输入书籍ISBN"/>
            </el-form-item>
          </div>
          <el-form-item label="商品描述" style="width: 900px; margin-top: 25px">
            <el-input v-model="bookInfo.description" type="textarea" placeholder="请输入商品描述" :rows="2" />
          </el-form-item>
          <div style="display: flex; margin-top: 25px">
            <el-form-item label="商品图片">
              <el-upload
                  class="avatar-uploader"
                  :show-file-list="false"
                  :before-upload="beforeImageUpload"
                  :limit="1"
              >
                <img v-if="bookInfo.cover" :src="bookInfo.cover" class="avatar"/>
                <el-icon v-else class="avatar-uploader-icon"><Plus/></el-icon>
              </el-upload>
            </el-form-item>
            <div>
              <div style="display: flex; margin-top: 15px">
                <el-form-item label="装帧" style="width: 250px;">
                  <el-input v-model="bindingAndLayout" placeholder="装帧"/>
                </el-form-item>
                <el-form-item label="出版社" style="width: 400px;">
                  <el-input v-model="publishingHouse" placeholder="出版社"/>
                </el-form-item>
              </div>
              <div style="display: flex; margin-top: 15px">
                <el-form-item label="页数" style="width: 250px;">
                  <el-input v-model="pages" placeholder="页数"/>
                </el-form-item>
                <el-form-item label="出版日期">
                  <el-date-picker
                      v-model="publicationDate"
                      type="date"
                      placeholder="选择日期"
                      :size="'default'"
                  />
                </el-form-item>
              </div>
            </div>
          </div>
          <el-form-item label="商品详细说明" style="width: 900px; margin-top: 25px">
            <el-input v-model="bookInfo.detail" type="textarea" placeholder="请输入商品详细说明" :rows="5" />
          </el-form-item>
        </el-form>
      </el-main>
      </div>
    </span>
    <template #footer>
      <div class="dialog-footer" style="width: 1000px;">
        <el-button @click="addBook" type="primary" >
          确定
        </el-button>
        <el-button @click="centerDialogVisible2 = false">取消</el-button>
      </div>
    </template>
  </el-dialog>

  <!--创建广告弹出窗口-->
  <el-dialog v-model="centerDialogVisible3" title="创建广告" width="800" center>
    <span style="display: flex">
      <div>
        <el-main>
          <el-form :model="createAdvertisementInfo" label-width="auto" style="margin-top: 10px">
            <el-form-item label="广告标题" style="width: 300px; display: flex">
              <el-input v-model="createAdvertisementInfo.title" placeholder="请输入广告标题"/>
            </el-form-item>
            <el-form-item label="广告图片">
              <el-upload
                  class="avatar-uploader"
                  :show-file-list="false"
                  :before-upload="beforeImageUpload"
                  :limit="1"
              >
                <img v-if="createAdvertisementInfo.imgUrl" :src="createAdvertisementInfo.imgUrl" class="avatar"/>
                <el-icon v-else class="avatar-uploader-icon"><Plus/></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="广告内容" style="width: 700px; margin-top: 25px">
              <el-input v-model="createAdvertisementInfo.content" type="textarea" placeholder="请输入广告内容" :rows="3" />
            </el-form-item>
             <el-form-item label="商品Id" style="width: 300px; display: flex">
              <el-input v-model="createAdvertisementInfo.productId" placeholder="请输入商品Id"/>
            </el-form-item>
          </el-form>
        </el-main>
      </div>
    </span>
    <template #footer>
      <div class="dialog-footer" style="width: 800px;">
        <el-button @click="createAdvertisement" type="primary" >
          确定
        </el-button>
        <el-button @click="centerDialogVisible3 = false">取消</el-button>
      </div>
    </template>
  </el-dialog>

  <!--更新广告弹出窗口-->
  <el-dialog v-model="centerDialogVisible4" title="更新广告" width="800" center>
    <span style="display: flex">
      <div>
        <el-main>
          <el-form :model="updateAdvertisementInfo" label-width="auto" style="margin-top: 10px">
            <el-form-item label="广告标题" style="width: 300px; display: flex">
              <el-input v-model="updateAdvertisementInfo.title" placeholder="请输入广告标题"/>
            </el-form-item>
            <el-form-item label="广告图片">
              <el-upload
                  class="avatar-uploader"
                  :show-file-list="false"
                  :before-upload="beforeImageUpload"
                  :limit="1"
              >
                <img v-if="updateAdvertisementInfo.imgUrl" :src="createAdvertisementInfo.imgUrl" class="avatar"/>
                <el-icon v-else class="avatar-uploader-icon"><Plus/></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="广告内容" style="width: 700px; margin-top: 25px">
              <el-input v-model="updateAdvertisementInfo.content" type="textarea" placeholder="请输入广告内容" :rows="3" />
            </el-form-item>
             <el-form-item label="商品Id" style="width: 300px; display: flex">
              <el-input v-model="updateAdvertisementInfo.productId" placeholder="请输入商品Id"/>
            </el-form-item>
          </el-form>
        </el-main>
      </div>
    </span>
    <template #footer>
      <div class="dialog-footer" style="width: 800px;">
        <el-button @click="updateAdvertisementClick" type="primary" >
          确定
        </el-button>
        <el-button @click="centerDialogVisible4 = false">取消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<style scoped>

.page {
  height: 1000px;
  width: 100%;
}

.card-header{
  height: 40px;
  display: flex;
}

.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 250px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #565656;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #dddddd;
}

.book-card {
  transition: transform 0.3s ease;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 190px;
}

.book-image{
  width: 180px;
  height: 180px;
  object-fit: cover;
}

.book-name {
  font-weight: bold;
  font-size: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.advertisement-book-name {
  font-weight: bold;
  font-size: xx-large;
  word-break: break-word; /* 允许长单词换行 */
  overflow: hidden; /* 溢出部分隐藏 */
  text-overflow: ellipsis; /* 溢出部分显示省略号 */
  display: -webkit-box; /* 使用 Webkit 内核的 box 布局 */
  -webkit-box-orient: vertical; /* 垂直排列 */
  -webkit-line-clamp: 2; /* 限制显示 2 行 */
  line-height: 1.5; /* 设置行高，确保文字不重叠 */
}

.advertisement-book-content{
  word-break: break-word; /* 允许长单词换行 */
  overflow: hidden; /* 溢出部分隐藏 */
  text-overflow: ellipsis; /* 溢出部分显示省略号 */
  display: -webkit-box; /* 使用 Webkit 内核的 box 布局 */
  -webkit-box-orient: vertical; /* 垂直排列 */
  -webkit-line-clamp: 5; /* 限制显示 5 行 */
  line-height: 1.5; /* 设置行高，确保文字不重叠 */
}

.book-price {
  width: 150px;
  margin-top: 5px;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transparent-table {
  --el-table-bg-color: rgba(0, 0, 0, 0); /* 表格背景色透明 */
  --el-table-border-color: rgba(0, 0, 0, 0.2); /* 表格边框颜色半透明 */
  --el-table-header-bg-color: rgba(0, 0, 0, 0); /* 表头背景色透明 */
  --el-table-header-font-color: #ffffff; /* 表头文字颜色 */
  --el-table-text-color: #ffffff; /* 表格文字颜色 */
  --el-table-tr-bg-color: rgba(0, 0, 0, 0); /* 表格行背景色透明 */
  --el-table-current-row-bg-color: rgba(0, 0, 0, 0.2); /* 当前行背景色半透明 */
  --el-table-hover-row-bg-color: rgba(0, 0, 0, 0.1); /* 悬停行背景色半透明 */
}

.avatar-uploader{
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  height: 120px;
  width: 120px;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
}
</style>