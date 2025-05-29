<script setup lang="ts">
import {ref, onMounted, reactive, computed, watch} from 'vue';
import {ElMessage, UploadProps} from 'element-plus';
import {Back, Service, Delete, Plus, Comment, Star, ShoppingCart, Promotion, MessageBox} from '@element-plus/icons-vue'
import {deleteProduct, getSpecificProduct, getStockpile, updateProduct} from "@/api/product";
import { useRoute,useRouter } from "vue-router";
import { addBookToCart } from "@/api/cart";

const route = useRoute();
// 获得书籍Id号
const bookId = Number(route.params.bookId);
const router = useRouter();

// 进入页面触发获取商品信息和库存数量
onMounted(async () => {
  fetchBookData(bookId);
  if(bookData.value){
    console.log("bookId:",bookData.value);
  }
  fetchAmount(bookId);
})

// 售后框是否出现
const centerDialogVisible = ref(false)
// 修改信息框是否出现
const centerDialogVisible2 = ref(false)

// 售后框用户书写内容
const afterSaleComment = ref('');

// 指定书本内容
interface ProductVO {
  id: number,
  title: string,
  price: number,
  rate: number,
  description: string,
  cover: string,
  detail: string,
  specifications: Specifications[];
  stockpile: Stockpile;
}

interface Specifications {
  id: number | null;
  item: string,
  value: string,
  product_id: number | null;
}

interface Stockpile {
  id: number | null;
  product_id: number | null;
  amount: number;
  frozen: number;
}
const bookData = ref<ProductVO>();
// 剩余库存
const amount = ref(0);

// 购买数量
const buyNum = ref(0);

// 商品评价
const commentInput = ref('')
const commentList = ref([
  {
    user: '小明',
    content: '这个商品真的太棒了！质量非常好，使用起来很顺手，完全符合我的预期，非常满意这次购买！',
    score: 5,
    time: '2024-11-01 10:30:25',
  },
  {
    user: '李华',
    content: '收到货后发现和描述的不太一样，有些瑕疵，不过客服态度很好，处理问题很及时。总体来说还不错。',
    score: 3,
    time: '2024-11-02 14:20:15',
  },
  {
    user: '张三',
    content: '物流很快，包装也很严实，商品质量超出了我的期望，价格也很实惠，以后还会再来购买！',
    score: 5,
    time: '2024-11-03 09:45:30',
  }
]);

// 修改数据
interface UpdateInfo {
  id: number;
  title: string,
  price: number,
  rate: number,
  description: string,
  cover: string,
  detail: string,
  specifications: Specifications[];
  stockpile: Stockpile;
}

const bookInfo = reactive<UpdateInfo>({
  id: 0,
  title: '',
  price: 0,
  rate: 0,
  description: '',
  cover: '',
  detail: '',
  specifications: [],
  stockpile: { id: 0, product_id: 0, amount: 0, frozen: 0 },
});
// 使用 watch 来监听 bookData 的变化
watch(bookData, (newValue) => {
  if (newValue) {
    bookInfo.id = newValue.id;
    bookInfo.title = newValue.title;
    bookInfo.price = newValue.price;
    bookInfo.rate = newValue.rate;
    bookInfo.description = newValue.description;
    bookInfo.cover = newValue.cover;
    bookInfo.detail = newValue.detail;
    bookInfo.specifications = newValue.specifications;
    bookInfo.stockpile = newValue.stockpile;
  }
}, { immediate: true }); // 立即执行一次，确保初始值正确

// 获得商品信息
function fetchBookData(bookId: number) {
    getSpecificProduct(bookId)
        .then((res) => {
          console.log("res.data:", res.data);
          bookData.value = res.data;
          console.log("bookData!",bookData);
        })
        .catch((error) => {
          console.error("书籍获取失败！", error);
        });
}
// 获得库存
function fetchAmount(bookId: number) {
  try{
    getStockpile(bookId).then((res) => {
      amount.value = res.data;
    });
  }catch(error){
    ElMessage.error('库存获取失败，请稍后再试！');
  }
}
// 返回主页
function returnBack(){
  router.push('/store-detail');
}
// 购物数量数值修改
const handleChange = (value: number | undefined) => {
  console.log(value)
}

function submitChange(){
  try {
    updateProduct(bookInfo).then((res) => {
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
    centerDialogVisible2.value = false;
  } catch (error) {
    ElMessage.error('修改商品信息失败！')
  }
}

function addToCart(){
  // 此处修改购物车商品数量
  try{
    addBookToCart(bookId, buyNum.value).then((res) => {
      if (res.data.code === '000') {  //类型守卫，它检查 res.data 对象中是否存在名为 code 的属性
        ElMessage({
          message: "加入购物车成功！",
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
    centerDialogVisible2.value = false;
  } catch (error) {
    ElMessage.error('加入购物车失败！');
  }
}

function afterSale(){
  ElMessage.success('售后按钮已点击！');
  centerDialogVisible.value = true;
}

function sendAfterSale(){
  ElMessage.success('提交售后请求成功！');
  centerDialogVisible.value = false;
}

function deleteBook(){
  try {
    deleteProduct(bookId).then((res) => {
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
  }catch(error){
    ElMessage.error('删除失败！')
  }
  router.push('/store-detail');
  ElMessage.success('删除按钮已点击！');
}

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

const displayRate = computed({
  get() {
    return bookData.value?.rate || 0;
  },
  set(value) {
    if (bookData.value) {
      bookData.value.rate = value;
    }
  }
});

// 处理specifications的增减
const deleteRow = (index: number) => {
  bookInfo.specifications.splice(index, 1)
}

const newItem = ref('');
const newValue = ref('');
const onAddItem = () => {
  bookInfo.specifications.push({
    id: null,
    item: newItem.value,
    value: newValue.value,
    product_id: bookId,
  })
  newItem.value = '';
  newValue.value = '';
  ElMessage.success("添加成功！");
}
</script>

<template>
  <el-container>
    <el-header class="bar-header">
      <div style="display: flex">
        <div style="color: black; font-weight: bold; font-size: x-large; margin-left: 10px; margin-top: 10px">番茄商店</div>
        <el-icon style="margin-left: 850px; margin-top: 25px"><Star /></el-icon>
        <div style="margin-top: 20px" @click="">收藏夹</div>
        <el-icon style="margin-left: 30px; margin-top: 25px"><ShoppingCart /></el-icon>
        <div style="margin-top: 20px" @click="">购物车</div>
        <el-icon style="margin-left: 30px; margin-top: 25px"><Service /></el-icon>
        <div style="margin-top: 20px" @click="afterSale">售后</div>
        <el-icon style="margin-left: 30px; margin-top: 25px"><MessageBox /></el-icon>
        <div style="margin-top: 20px" @click="">消息</div>
        <el-button class="submit-change" type="warning" @click="centerDialogVisible2=true" size="default" style="margin-left: 60px; margin-top: 15px; font-size: small">更改商品信息</el-button>
      </div>
    </el-header>
    <el-container style="height: 700px">
      <el-aside style="height: 100%; width: 700px">
        <div @click="returnBack" style="margin-top: 40px;margin-left: 40px">
          <el-icon style="vertical-align: middle; font-size: xx-large">
            <Back/>
          </el-icon>
        </div>
        <div style="display: flex; margin-top: 25px;margin-left: 45px">
          <div style="color:#b8b7b7;">商品</div><div style="margin-left: 8px">/ {{bookData?.title || ''}}</div>
        </div>
        <div style="margin-top: 80px; margin-left: 45px; font-size: xx-large; font-weight: bolder">{{bookData?.title || ''}}</div>
        <div style="display: flex; width: 80%; margin-left: 45px;margin-top: 20px">
          <div style="font-size: large; font-weight: bold; margin-top: 2px">￥{{bookData?.price || 0}}</div>
          <el-rate style="margin-left: 150px"
                   v-model="displayRate"
                   disabled
                   show-score
                   text-color="#ff9900"
                   score-template="{value} points"
          />
          <el-text style="margin-left: 60px">剩余库存: {{bookData?.stockpile.amount}}</el-text>
        </div>
        <div style="height: 100px; margin-top: 50px; width: 90%; margin-left: 45px; display: flex; align-items: center;">
          <el-text class="description">{{ bookData?.detail }}</el-text>
        </div>
        <div style="display:flex; margin-left: 45px; margin-top: 60px">
          <el-input-number v-model="buyNum" :min="1" :max="10000" @change="handleChange" />
          <el-button class="add-to-cart" @click="addToCart" size="large" style="margin-left: 50px; background-color: #565656; color: white; font-size: large">加入购物车</el-button>
          <el-button type="danger" size="large" :icon="Delete" circle style="margin-left: 50px" @click="deleteBook"/>
        </div>
        <div style="display: flex; margin-top: 30px; margin-left: 45px">
          <el-text style="margin-left: 15px; margin-top: 30px" v-for="spec in bookData?.specifications?.slice(0,6)" :key="spec.id">
            <strong>{{ spec.item }}:</strong><br> {{ spec.value }}
          </el-text>
        </div>
      </el-aside>
      <el-main>
        <el-image
            style="width: 550px; height: 600px; margin-left: 90px; margin-top: 50px"
            :src="bookData?.cover"
            :fit="'contain'"
        />
      </el-main>
    </el-container>
    <!--商品评价-->
    <el-container style="height: 200px;display: flex; flex-direction: column">
      <div style="display: flex; height: 70px">
        <div style="color: black; font-weight: bold; font-size: xx-large; margin-left: 40px; margin-top: 10px">商品评价</div>
        <div style="font-size: x-large; margin-left: 10px"><el-icon><Comment /></el-icon></div>
        <div style="color: black; font-size: large; margin-left: 900px; margin-top: 20px">推荐商品人数：{{0}}</div>
      </div>
      <div style="width: 96%;margin-left: 2%;margin-top: 10px">
        <div style="display: flex;height: 50px; margin-top: 10px">
          <el-avatar :size="50" :src="avatarUrl" />
          <el-input
              v-model="commentInput"
              style="width: 90%; height: 40px;margin-top: 5px;margin-left: 8px"
              placeholder="说点什么吧~"
              clearable
          />
          <el-button class="send-comment" @click="" style="margin-left: 10px;margin-top: 5px;height: 40px;width: 60px;border-radius: 10px;background-color: #565656;color: white;font-size: large"><el-icon><Promotion /></el-icon></el-button>
        </div>
       <el-card class="comment-card" v-for="(comment,index) in commentList" :key="index" style="margin-top: 30px; height: 200px;border-radius: 20px">
        <div class="username" style="height: 30px; font-weight: bolder">{{comment.user}} :</div>
        <div class="comment-content" style="height: 105px">{{comment.content}}</div>
        <div class="comment-time" style="font-size: small;color: #b8b7b7">{{comment.time}}</div>
       </el-card>
      </div>
    </el-container>
    <el-backtop :right="50" :bottom="50" style="color: #565656"/>
  </el-container>

  <!--售后弹窗部分-->
  <el-dialog
      v-model="centerDialogVisible"
      title="请写售后原因"
      width="800"
      align-center
  >
    <el-input
        v-model="afterSaleComment"
        style="width: 750px"
        :rows="12"
        type="textarea"
        placeholder="Please input"
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="sendAfterSale">
          提交
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!--修改信息弹出窗口-->
  <el-dialog v-model="centerDialogVisible2" title="修改商品信息" width="1000" center>
    <span>
      <el-main>
        <el-form :model="bookInfo" label-width="auto" style="margin-top: 10px">
          <div style="display: flex;">
            <el-form-item label="商品名称" style="width: 300px; display: flex">
              <el-input v-model="bookInfo.title" placeholder="请输入商品名称"/>
            </el-form-item>
          </div>
          <div style="display: flex; margin-top: 25px">
            <el-form-item label="商品价格" style="width: 300px;">
              <el-input v-model="bookInfo.price" placeholder="请输入商品价格（单位：元）"/>
            </el-form-item>
            <el-form-item label="商品评分" style="width: 300px">
              <el-rate v-model="bookInfo.rate" allow-half />
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
          </div>
          <el-form-item label="基本信息">
            <el-table :data="bookInfo.specifications" style="width: 100%" max-height="200">
              <el-table-column prop="item" label="Item" width="250" />
              <el-table-column prop="value" label="Value" width="250" />
              <el-table-column fixed="right" label="Operations" min-width="50">
                <template #default="scope">
                  <el-button
                      link
                      type="primary"
                      size="small"
                      @click.prevent="deleteRow(scope.$index)"
                  >
                    Remove
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div style="display: flex">
              <el-input v-model="newItem" style="width: 250px" placeholder="请输入新的Item"/>
              <el-input v-model="newValue" style="width: 250px;margin-left: 10px" placeholder="请输入新的Value"/>
              <el-button class="mt-4" style="width: 200px;margin-left: 10px" @click="onAddItem">
                Add Item
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="商品详细说明" style="width: 900px; margin-top: 25px">
            <el-input v-model="bookInfo.detail" type="textarea" placeholder="请输入商品详细说明" :rows="4" />
          </el-form-item>
          <el-form-item label="库存" style="width: 300px">
            <el-input v-model="bookInfo.stockpile.amount" placeholder="请输入库存"/>
          </el-form-item>
        </el-form>
      </el-main>
    </span>
    <template #footer>
      <div class="dialog-footer" style="width: 1000px;">
        <el-button @click="submitChange" type="primary" >
          确定
        </el-button>
        <el-button @click="centerDialogVisible2 = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.bar-header{
  border-bottom: 1px solid #ddd;
}

.description{
  font-size: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
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

.send-comment:hover{
  transform: translateY(-5px);
}


</style>