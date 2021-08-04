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
      <Stock :totalBookNum="this.totalBookNum" :curBookNum="this.curBookNum" />

      <!-- 예약 현황 -->
      <Rsv
        :totalUserNum="this.totalUserNum"
        :cancelUserNum="this.cancelUserNum"
        :UserNum="this.UserNum"
        :curUserNum="this.curUserNum"
      />
    </v-row>

    <!-- 등록되어 있는 책 목록 -->
    <BookList :bookId="this.$route.params.id" />

    <!-- 예약자 명단 -->
    <RsvList :bookId="this.$route.params.id" />

    <!-- 스낵바 -->
    <v-snackbar class="snackbar" v-model="snackbar" :timeout="timeout" bottom>
      {{ text }}

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          닫기
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import api from "@/key";
import BookInfo from "../components/ShowDetail/BookInfo.vue";
import Stock from "../components/ShowDetail/Stock.vue";
import Rsv from "../components/ShowDetail/Rsv.vue";
import HomeButton from "../components/ShowDetail/HomeButton.vue";
import BookList from "../components/ShowDetail/BookList.vue";
import RsvList from "../components/ShowDetail/RsvList.vue";
export default {
  components: {
    BookInfo,
    Stock,
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

      //거래 완료 예약자 수
      finishUserNum: 0,

      //취소된 예약자 수
      cancelUserNum: 0,

      //총 재고 수
      totalBookNum: null,

      //판매 중인 재고 수
      curBookNum: 0,

      //   책목록 배열
      books: [],

      //   예약자 목록 배열
      users: [],
    };
  },

  computed: {},

  watch: {},

  // api 연결
  //테이블 초기화.
  created() {
    this.bookId = this.$route.params.id;
    this.initialize();
  },

  methods: {
    // 사용자 예약 새고로침
    userRefresh() {
      this.isRefresh = true;
      this.getUserList();
    },

    //재고 목록 조회
    //초기화 함수(재고, 예약)
    //현재 등록되어 있는 책의 수(totalUserNum), 책 정보를 가져와서 재고 테이블에 초기화.
    async getBookList() {
      //상위 컴포넌트로부터 props를 받던 get방식으로 받던 책의 id값을 받아와서 해당 api에 던져줘야 함.
      await this.axios
        .get(`${api.url}/books/${this.bookId}/stocks`)
        .then((res) => {
          this.curBookNum = 0;
          res.data.map((value) => {
            if (!value.isSold) {
              value.isSold = "판매 중";
              this.curBookNum++;
            } else {
              value.isSold = "판매 완료";
            }
          });
          this.totalBookNum = res.data.length;
          this.books = res.data;
        })
        .catch((err) => {
          this.snackbarControll("재고 목록 조회 실패");
          console.log(err);
        });
    },

    //예약 목록 조회

    //현재 예약자 수(curUserNum), 예약자 총 명단을 가져와서 예약자 명단 테이블에 초기화.
    async getUserList() {
      await this.axios
        .get(`${api.url}/books/${this.bookId}/reservations`)
        .then((res) => {
          this.totalUserNum = res.data.length;
          this.curUserNum = 0;
          this.cancelUserNum = 0;
          this.finishUserNum = 0;

          // 예약관리
          res.data.map((value) => {
            // 유효한 상태
            if (value.isCancel === false) {
              value.isCancel = "유효";
              // 예약 진행중
              if (value.isSold === false) {
                value.isSold = "예약 진행중";
                this.curUserNum++;
              }
              // 거래 완료
              else {
                value.isSold = "거래 완료";
                this.finishUserNum++;
              }
            }
            // 취소한 상태
            else {
              value.isCancel = "취소";
              this.cancelUserNum++;
              if (value.isSold === false) {
                value.isSold = "예약 진행중";
              } else {
                value.isSold = "거래 완료";
              }
            }
          });
          this.users = res.data;
          if (this.isRefresh) {
            this.snackbarControll("예약 목록 새로고침 완료");
            this.isRefresh = !this.isRefresh;
          }
        })
        .catch((err) => {
          this.snackbarControll("예약 목록 조회 실패");
          console.log(err);
        });
    },

    //각 함수 호출, 초기화
    //created 에서 수행.
    initialize() {
      // 재고 목록 초기화
      this.getBookList();

      // 예약 목록 초기화
      this.getUserList();
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
