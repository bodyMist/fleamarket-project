<template>
  <v-row>
    <v-col>
      <v-card class="bookTableCover">
        <v-data-table
          :headers="bookHeaders"
          :items="books"
          sort-by="isSold"
          sort-desc
          class="elevation-2 bookTable"
          mobile-breakpoint="0"
          :search="searchBook"
        >
          <template v-slot:item.isSold="{ item }">
            <v-chip :color="getColor(item.isSold)" dark>
              {{ item.isSold }}
            </v-chip>
          </template>
          <template v-slot:top>
            <v-toolbar flat>
              <v-container>
                <v-row>
                  <v-col cols="5">
                    <v-toolbar-title>재고 목록</v-toolbar-title>
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="searchBook"
                      append-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                    >
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container>

              <v-dialog persistent v-model="dialogBook" max-width="500px">
                <!-- 예약 버튼 -->
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    color="primary"
                    dark
                    class="mb-2"
                    v-bind="attrs"
                    v-on="on"
                  >
                    추가하기
                  </v-btn>
                </template>

                <!-- Dialog -->
                <v-card>
                  <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                  </v-card-title>

                  <!-- 신규 예약시 작성 요소 -->
                  <!-- 날짜, 시간, 이름, 학번, 비밀번호 -->
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12" sm="6" md="6">
                          <v-text-field
                            v-model="editedBookItem.name"
                            label="판매자 이름"
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" sm="6" md="6">
                          <v-text-field
                            v-model="editedBookItem.studentId"
                            label="판매자 학번"
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" sm="6" md="6">
                          <v-text-field
                            v-model="editedBookItem.price"
                            label="판매가격"
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" sm="6" md="6">
                          <v-select
                            :items="selectState"
                            label="책상태"
                            v-model="editedBookItem.state"
                          >
                          </v-select>
                        </v-col>

                        <v-col cols="12" sm="6" md="6">
                          <v-select
                            v-if="formTitle === '추가'"
                            disabled
                            :items="selectIsSold"
                            item-value="판매 중"
                            item
                            label="판매 중"
                            v-model="editedBookItem.isSold"
                          />

                          <v-select
                            v-else
                            :items="selectIsSold"
                            label="판매여부"
                            v-model="editedBookItem.isSold"
                          />
                          <!-- <v-select
                            :items="selectIsSold"
                            label="판매여부"
                            v-model="editedBookItem.isSold"
                          /> -->
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeBook">
                      취소
                    </v-btn>
                    <v-btn color="blue darken-1" text @click="saveBook">
                      저장
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <!-- 삭제(본인만 가능하도록) -->
              <!-- 삭제시 학번, 비밀번호 요구. 선택된 예약과 학번, 비밀번호가 맞으면 예약 삭제 -->
              <v-dialog persistent v-model="dialogBookDelete" max-width="500px">
                <v-card>
                  <v-container>
                    <v-row>
                      <v-col cols="6"></v-col>
                      <v-col cols="6"></v-col>
                    </v-row>
                  </v-container>
                  <v-card-title class="headline"
                    >재고를 삭제하시겠습니까</v-card-title
                  >
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeBookDelete"
                      >아니오</v-btn
                    >
                    <v-btn
                      color="blue darken-1"
                      text
                      @click="deleteBookItemConfirm"
                      >네</v-btn
                    >
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editBookItem(item)">
              mdi-pencil
            </v-icon>
            <v-icon small @click="deleteBookItem(item)"> mdi-delete </v-icon>
          </template>
          <template v-slot:no-data>
            <div v-if="totalBookNum === null">
              <v-progress-linear indeterminate color="cyan"></v-progress-linear>
            </div>
            <div v-else>재고 없음</div>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import {
  getBookListapi,
  addBookListapi,
  delBookListapi,
} from "../../api/api.js";
export default {
  components: {},
  props: {
    bookId: String,
  },
  created() {
    this.getBookList();
  },
  computed: {
    formTitle() {
      return this.editedBookIndex === -1 ? "추가" : "수정";
    },
  },
  watch: {
    // 재고
    dialogBook(val) {
      val || this.closeBook();
    },
  },
  data() {
    return {
      //스낵바
      snackbar: false,
      text: "",
      selectState: ["A", "B", "C"],
      selectIsSold: ["판매 중", "판매 완료"],
      //총 재고 수
      totalBookNum: null,
      //   책목록 배열
      books: [],
      //책
      editedBookIndex: -1,
      editedBookItem: {
        name: "",
        studentId: "",
        price: "",
        state: "",
        isSold: "",
      },

      dialogBook: false,
      dialogBookDelete: false,
      searchBook: "",
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

      // 데이터 수정 관련 변수
      isDeleted: false,
      tempBook: [],
    };
  },
  methods: {
    //재고 목록 조회
    //초기화 함수(재고, 예약)
    //현재 등록되어 있는 책의 수(totalUserNum), 책 정보를 가져와서 재고 테이블에 초기화.
    getBookList() {
      // 상위 컴포넌트로부터 props를 받던 get방식으로 받던 책의 id값을 받아와서 해당 api에 던져줘야 함.
      getBookListapi(this.bookId)
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

          //상위 컴포넌트로 전달할 데이터
          const Bookobj = {
            totalBookNum: this.totalBookNum,
            curBookNum: this.curBookNum,
          };
          this.setBookData(Bookobj);
        })
        .catch((err) => {
          this.snackbarControll("재고 목록 조회 실패");
          console.log(err);
        });
    },

    setBookData(obj) {
      this.$emit("getBookData", obj);
    },

    //스낵바
    //스낵바 상태를 상위 컴포넌트로 전달.
    setSnackbar(inputText) {
      this.snackbar = true;
      this.text = inputText;
      const obj = {
        snackbar: this.snackbar,
        text: this.text,
      };
      this.$emit("snackbarControll", obj);
    },
    //재고 추가
    addBooksList(item, msg1, msg2) {
      let body = {
        name: item.name,
        studentId: item.studentId,
        price: item.price,
        state: item.state,
        isSold: item.isSold,
      };

      if (body.isSold === "판매 완료") {
        body.isSold = true;
      } else {
        body.isSold = false;
      }

      addBookListapi(this.bookId, body)
        .then(() => {
          this.getBookList();
          this.setSnackbar(msg1);
        })
        .catch((err) => {
          this.setSnackbar(msg2);
          this.getBookList();
          console.log(err);
          console.log(err.response);
          console.log(err.config);
        });
    },
    // 상태별 색 부여
    getColor(item) {
      if (item === "판매 완료" || item === "거래 완료" || item === "취소") {
        return "red";
      } else return "green";
    },
    //재고 기능 동작 함수
    editBookItem(item) {
      this.editedBookIndex = this.books.indexOf(item);
      this.editedBookItem = Object.assign({}, item);
      this.dialogBook = true;
      this.tempBook = Object.assign({}, this.editedBookItem);
    },

    //삭제 아이콘을 누르자 마자 수행
    deleteBookItem(item) {
      // 해당 재고 아이디값 설정
      this.delBookId = item.id;

      this.editedBookIndex = this.books.indexOf(item);
      this.editedBookItem = Object.assign({}, item);
      this.dialogBookDelete = true;
    },

    //삭제 확인을 누르면 수행
    deleteBookItemConfirm() {
      //백엔드 삭제 요청
      this.delBooks(this.editedBookItem);

      this.books.splice(this.editedBookIndex, 1);
      this.closeBookDelete();
    },

    //dialog 닫히면 수행
    closeBook() {
      // dialog 닫히면 초기화
      (this.delBookId = ""), (this.dialogBook = false);
      this.$nextTick(() => {
        this.editedBookItem = Object.assign({}, this.defaultBookItem);
        this.editedBookIndex = -1;
      });
    },

    //삭제 확인을 누르면 deleteItemConfirm 이후 수행
    closeBookDelete() {
      this.dialogBookDelete = false;
      this.$nextTick(() => {
        this.editedBookItem = Object.assign({}, this.defaultBookItem);
        this.editedBookIndex = -1;
      });
    },

    //신규 데이터 생성, 기존 데이터 변경 시 모달창의 저장버튼을 누르면 수행
    saveBook() {
      //수정하는경우
      if (this.editedBookIndex > -1) {
        //삭제 하고 추가 되는 기능으로 변경되어야 함.
        // 기존 방식 사용 불가
        // Object.assign(this.books[this.editedBookIndex], this.editedBookItem);
        // this.modiBooksList(this.books[this.editedBookIndex]);

        // 1. 기존 아이템 삭제 절차
        // 만약 기존 수정 api 활성화 되면 아래 코드는 주석처리.
        this.delBookId = this.tempBook.id;

        this.editedBookIndex = this.books.indexOf(this.tempBook);
        this.tempBook = Object.assign({}, this.tempBook);

        const changeBookData = Object.assign({}, this.editedBookItem);

        //서버에 삭제 요청
        const delBody = {
          data: {
            state: this.tempBook.state,
          },
        };

        delBookListapi(this.bookId, this.delBookId, delBody)
          .then(() => {
            this.books.splice(this.editedBookIndex, 1);
            this.$nextTick(() => {
              this.tempBook = Object.assign({}, this.tempBook);
              this.editedBookIndex = -1;
              this.isDeleted = true;
            });

            this.addBooksList(
              changeBookData,
              "재고를 수정하였습니다.",
              "재고 수정 실패"
            );
          })
          .catch((err) => {
            this.setSnackbar("재고 수정 실패");
            this.getBookList();
            console.log(err);
          });
      }

      //추가하는 경우
      else {
        this.books.push(this.editedBookItem);

        //재고추가 post
        const curIndex = this.books.indexOf(this.editedBookItem);
        this.addBooksList(
          this.books[curIndex],
          "재고를 추가하였습니다.",
          "재고 추가 실패"
        );
      }
      this.closeBook();
    },

    // 기존 재고 수정
    // 삭제후, 변경 데이터로 재 등록하는 방식으로 해야함.
    modiBooksList(item) {
      console.log(item);
      // let body = {
      //   name: item.name,
      //   studentId: item.studentId,
      //   price: item.price,
      //   state: item.state,
      //   isSold: item.isSold,
      // };
      // if (body.isSold === "판매 완료") {
      //   body.isSold = true;
      // } else {
      //   body.isSold = false;
      // }
      // 기존 수정 api
      // 백엔드 내부 구조상 재고 변경이 불가능 하기 때문에 해당 api 사용 불가
      // this.axios
      //   .put(`${api.url}/admin/stocks/${item.id}`, body)
      //   .then(() => {
      //     // this.snackbar = true;
      //     setTimeout(() => {
      //       this.getBookList();
      //     }, 1000);
      //     this.setSnackbar("재고를 수정하였습니다.");
      //   })
      //   .catch((err) => {
      //     this.setSnackbar("재고 수정 실패");
      //     this.getBookList();
      //     console.log(err);
      //   });
    },

    //재고 삭제
    delBooks(item) {
      const body = {
        data: {
          state: item.state,
        },
      };

      delBookListapi(this.delBookId, body)
        .then(() => {
          setTimeout(() => {
            this.getBookList();
          }, 1000);
          this.setSnackbar("재고를 삭제하였습니다.");
        })
        .catch((err) => {
          this.setSnackbar("재고 삭제 실패");
          this.getBookList();
          console.log(err);

          // 에러 확인
          // console.log(err.response);
          // console.log(err.config);
        });
    },
  },
};
</script>

<style>
.bookTableCover {
  overflow-x: scroll;
  white-space: nowrap;
  min-width: 200px;
}

.bookTable {
  display: inline-block;
  width: initial;
  min-width: 100%;
}
</style>
