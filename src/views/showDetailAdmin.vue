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
    <RsvList />
    <v-row>
      <v-col>
        <v-card class="userTableCover">
          <!-- 예약자 명단 테이블 -->
          <v-data-table
            :headers="userHeaders"
            :items="users"
            sort-by="isCancel"
            class="elevation-1 userTable"
            mobile-breakpoint="0"
            :search="searchUser"
          >
            <template v-slot:item.isSold="{ item }">
              <v-chip :color="getColor(item.isSold)" dark>
                {{ item.isSold }}
              </v-chip>
            </template>

            <template v-slot:item.isCancel="{ item }">
              <v-chip :color="getColor(item.isCancel)" dark>
                {{ item.isCancel }}
              </v-chip>
            </template>

            <template v-slot:top>
              <v-toolbar flat>
                <v-container>
                  <v-row>
                    <v-col cols="6">
                      <v-toolbar-title>예약자 명단</v-toolbar-title>
                    </v-col>
                    <v-col>
                      <v-text-field
                        v-model="searchUser"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-container>

                <v-btn color="primary" dark class="mb-2" @click="userRefresh">
                  새로고침
                </v-btn>

                <!-- 예약 정보 수정 -->
                <v-dialog persistent v-model="dialogModiUser" max-width="500px">
                  <!-- Dialog -->
                  <v-card>
                    <v-card-title>
                      <span class="headline"> 에약 여부 수정하기 </span>
                    </v-card-title>

                    <!-- 신규 예약시 작성 요소 -->
                    <!-- 날짜, 시간, 이름, 학번, 비밀번호 -->
                    <v-card-text>
                      <v-container>
                        <v-row>
                          <v-col cols="12">
                            <v-select
                              :items="selectUser"
                              label="예약여부"
                              v-model="editedUserItem.isSold"
                            >
                            </v-select>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="blue darken-1" text @click="closeUser">
                        취소
                      </v-btn>
                      <v-btn color="blue darken-1" text @click="modiUser">
                        저장
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <!-- 취소 -->
                <v-dialog
                  persistent
                  v-model="dialogCancelUser"
                  max-width="500px"
                >
                  <!-- Dialog -->
                  <v-card>
                    <v-card-title>
                      <span class="headline"
                        ><v-icon color="red">mdi-cancel</v-icon>(주의) 에약 취소
                        하기
                      </span>
                    </v-card-title>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="blue darken-1" text @click="closeUser">
                        취소
                      </v-btn>
                      <v-btn color="blue darken-1" text @click="cancelUser">
                        변경
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-toolbar>
            </template>

            <!-- Actions -->
            <template v-slot:item.actions="{ item }">
              <v-icon small class="mr-4" @click="editUserItem(item)">
                mdi-pencil
              </v-icon>
              <v-icon small @click="cancelUserItem(item)"> mdi-cancel </v-icon>
            </template>

            <!-- 로딩 / 데이터 없는 경우 -->
            <template v-slot:no-data>
              <div v-if="totalUserNum === null">
                <v-progress-linear
                  indeterminate
                  color="cyan"
                ></v-progress-linear>
              </div>
              <div v-else>예약자 없음</div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

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
      selectState: ["A", "B", "C"],

      selectIsSold: ["판매 중", "판매 완료"],

      selectUser: ["거래 완료", "예약 진행중"],

      searchBook: "",
      searchUser: "",

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

      bookHeaders: [
        {
          text: "이름",
          align: "start",
          sortable: true,
          value: "name",
        },
        { text: "학번", value: "studentId" },
        { text: "판매가격(원)", value: "price" },
        { text: "책상태", value: "state" },
        { text: "판매여부", value: "isSold" },
        { text: "Actions", value: "actions", sortable: false },
      ],

      userHeaders: [
        {
          text: "예약 취소 여부",
          align: "start",
          sortable: true,
          value: "isCancel",
        },

        {
          text: "이름",
          value: "name",
        },
        { text: "학번", value: "studentId" },
        { text: "날짜", value: "date" },
        { text: "시간", value: "time" },
        { text: "예약여부", value: "isSold" },
        { text: "정보 / 취소", value: "actions", sortable: false },
      ],

      //   책목록 배열
      books: [],

      //   예약자 목록 배열
      users: [],

      test: "가나다라",

      dialogBook: false,
      dialogBookDelete: false,

      dialogModiUser: false,
      dialogCancelUser: false,

      dialogUserDelete: false,

      //책
      editedBookIndex: -1,
      editedBookItem: {
        name: "",
        studentId: "",
        price: "",
        state: "",
        isSold: "",
      },
      defaultBookItem: {
        name: "",
        studentId: "",
        price: "",
        state: "",
        isSold: "",
      },

      //사용자
      editedUserIndex: -1,
      editedUserItem: {
        name: "",
        studentId: "",
        day: "",
        time: "",
      },
      defaultUserItem: {
        name: "",
        studentId: "",
        day: "",
        time: "",
      },

      // 삭제 관련 변수

      // 해당 재고 책 아이디
      delBookId: "",

      //해당 사용자 아이디, 비밀번호
      delUserId: "",
      delUserPs: "",

      //스낵바
      snackbar: false,
      text: "",
      timeout: 1000,

      isRefresh: false,
    };
  },

  computed: {
    formTitle() {
      return this.editedBookIndex === -1 ? "추가" : "수정";
    },

    UserNum() {
      return this.totalUserNum - this.cancelUserNum;
    },
  },

  watch: {
    // 재고
    dialogBook(val) {
      val || this.closeBook();
    },
    dialogBookDelete(val) {
      val || this.closeBookDelete();
    },

    // 예약
    dialogModiUser(val) {
      val || this.closeUser();
    },

    dialogCancelUser(val) {
      val || this.closeUser();
    },
  },

  // api 연결
  //테이블 초기화.
  created() {
    this.bookId = this.$route.params.id;
    this.initialize();
  },

  methods: {
    // 상태별 색 부여
    getColor(item) {
      if (item === "판매 완료" || item === "거래 완료" || item === "취소") {
        return "red";
      } else return "green";
    },

    //스낵바(알림)
    snackbarControll(inputText) {
      this.snackbar = true;
      this.text = inputText;
    },

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

    //-----초기화 함수 끝-----

    //사용자 에약 목록관련
    //기존 예약 조회, 삭제기능.

    // 예약 통신 함수

    // //dialog 닫히면 수행
    closeUser() {
      this.dialogModiUser = false;
      this.dialogCancelUser = false;
      this.$nextTick(() => {
        this.editedUserItem = Object.assign({}, this.defaultUserItem);
        this.editedUserIndex = -1;
      });
    },

    // 예약 수정
    editUserItem(item) {
      this.editedUserIndex = this.users.indexOf(item);
      this.editedUserItem = Object.assign({}, item);
      this.dialogModiUser = true;
    },

    modiUser() {
      Object.assign(this.users[this.editedUserIndex], this.editedUserItem);

      this.modiUsersList(this.users[this.editedUserIndex]);

      this.closeUser();
    },

    cancelUser() {
      Object.assign(this.users[this.editedUserIndex], this.editedUserItem);

      this.cancelUsersList(this.users[this.editedUserIndex]);

      this.closeUser();
    },

    async modiUsersList(item) {
      let body = {
        isSold: item.isSold,
      };
      if (body.isSold === "거래 완료") {
        body.isSold = true;
      } else {
        body.isSold = false;
      }

      await this.axios
        .put(`${api.url}/admin/reservations/${item.id}`, body)
        .then(() => {
          this.getUserList();
          this.snackbarControll("예약을 수정하였습니다.");
        })
        .catch((err) => {
          this.snackbarControll("예약 수정 실패");
          this.getUserList();
          console.log(err);
        });
    },

    // 취소 여부 수정

    cancelUserItem(item) {
      this.editedUserIndex = this.users.indexOf(item);
      this.editedUserItem = Object.assign({}, item);
      this.dialogCancelUser = true;
    },

    async cancelUsersList(item) {
      await this.axios
        .delete(`${api.url}/admin/books/${this.bookId}/reservations/${item.id}`)
        .then(() => {
          this.getUserList();
          this.snackbarControll("예약을 취소 하였습니다.");
        })
        .catch((err) => {
          this.snackbarControll("예약 수정 실패");
          this.getUserList();
          console.log(err);
        });
    },

    //-----예약 기능함수 끝-----
  },
};
</script>

<style>
.snackbar {
  margin-bottom: 5vh;
}

.userTableCover {
  overflow-x: scroll;
  white-space: nowrap;
  min-width: 200px;
}

.userTable {
  display: inline-block;
  width: initial;
  min-width: 100%;
}

.headCover {
  display: flex;
  justify-content: space-between;
}
</style>
