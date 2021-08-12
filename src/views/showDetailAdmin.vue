<template>
  <v-container>
    <!-- 책이름, 저자,출판사, 검색 -->
    <v-row>
      <v-col>
        <label class="headCover">
          <h1 class="head1">책 정보</h1>
          <HomeButton />
        </label>
      </v-col>

      <!-- 책 정보 -->
      <BookInfo
        :bookTitle="this.$route.params.title"
        :bookAuthor="this.$route.params.author"
        :bookPublisher="this.$route.params.publisher"
      />
    </v-row>
    <!-- 거래 현황 -->
    <v-row>
      <!-- 재고 현황 -->
      <Book :totalBookNum="this.totalBookNum" :curBookNum="this.curBookNum" />

      <!-- 예약 현황 -->
      <Rsv
        :totalUserNum="this.totalUserNum"
        :cancelUserNum="this.cancelUserNum"
        :UserNum="this.UserNum"
        :curUserNum="this.curUserNum"
      />
    </v-row>
    <!-- 등록되어 있는 책 목록 -->
    <BookList
      :bookId="this.$route.params.id"
      @getBookData="getBookData"
      @snackbarControll="snackbarControll"
    />

    <!-- 예약자 명단 -->
    <RsvList
      :bookId="this.$route.params.id"
      @getRsvData="getRsvData"
      @snackbarControll="snackbarControll"
    />

    <!-- 스낵바 -->
    <v-snackbar class="snackbar" v-model="snackbar" :timeout="timeout" bottom>
      {{ this.text }}

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          닫기
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import BookInfo from "../components/ShowDetail/BookInfo.vue";
import Book from "../components/ShowDetail/Book.vue";
import Rsv from "../components/ShowDetail/Rsv.vue";
import HomeButton from "../components/ShowDetail/HomeButton.vue";
import BookList from "../components/ShowDetail/BookList.vue";
import RsvList from "../components/ShowDetail/RsvList.vue";
export default {
  components: {
    BookInfo,
    Book,
    Rsv,
    HomeButton,
    BookList,
    RsvList,
  },

  data() {
    return {
      //총 예약자 수
      totalUserNum: null,

      //예약 진행중인 수
      curUserNum: 0,

      //취소된 예약자 수
      cancelUserNum: 0,

      //유효한 예약자 수
      UserNum: 0,

      //총 재고 수
      totalBookNum: null,

      //판매 중인 재고 수
      curBookNum: 0,

      bookId: "",

      snackbar: false,

      text: "",

      timeout: 1000,
    };
  },

  computed: {},

  watch: {},

  // api 연결
  //테이블 초기화.
  created() {
    this.bookId = this.$route.params.id;
  },

  methods: {
    //하위 컴포넌트(RsvList)로부터 예약자 수 정보를 받아옴
    getRsvData(data) {
      this.totalUserNum = data.totalUserNum;
      this.curUserNum = data.curUserNum;
      this.cancelUserNum = data.cancelUserNum;
      this.UserNum = data.totalUserNum - data.cancelUserNum;
    },

    //하위 컴포넌트(BookList)로부터 예약자 수 정보를 받아옴
    getBookData(data) {
      this.totalBookNum = data.totalBookNum;
      this.curBookNum = data.curBookNum;
    },

    //스낵바(알림)
    snackbarControll(obj) {
      this.text = obj.text;
      this.snackbar = obj.snackbar;
    },
  },
};
</script>

<style>
.headCover {
  display: flex;
  justify-content: space-between;
}
</style>
