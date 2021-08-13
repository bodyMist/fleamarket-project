<template>
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
              <v-dialog persistent v-model="dialogCancelUser" max-width="500px">
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
              <v-progress-linear indeterminate color="cyan"></v-progress-linear>
            </div>
            <div v-else>예약자 없음</div>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
// import api from "@/key";
import {
  getUserListapi,
  modiUsersListapi,
  cancelUsersListapi,
} from "../../api/api.js";
export default {
  data() {
    return {
      snackbar: false,
      text: "",
      dialogModiUser: false,
      dialogCancelUser: false,

      dialogUserDelete: false,
      users: [],
      selectUser: ["거래 완료", "예약 진행중"],
      searchUser: "",

      //총 예약자 수
      totalUserNum: null,

      //예약 진행중인 수
      curUserNum: 0,

      //거래 완료 예약자 수
      finishUserNum: 0,

      //취소된 예약자 수
      cancelUserNum: 0,
      //사용자
      editedUserIndex: -1,
      editedUserItem: {
        name: "",
        studentId: "",
        day: "",
        time: "",
        state: "",
      },
      defaultUserItem: {
        name: "",
        studentId: "",
        day: "",
        time: "",
        state: "",
      },

      userHeaders: [
        {
          text: "예약 취소 여부",
          align: "start",
          sortable: true,
          value: "isCancel",
          state: "",
        },

        {
          text: "이름",
          value: "name",
        },
        { text: "학번", value: "studentId" },
        { text: "상태", value: "state" },
        { text: "날짜", value: "date" },
        { text: "시간", value: "time" },
        { text: "예약여부", value: "isSold" },
        { text: "정보 / 취소", value: "actions", sortable: false },
      ],
    };
  },
  created() {
    this.getUserList();
  },
  components: {},
  props: {
    bookId: String,
  },
  computed: {},
  watch: {
    // 예약
    dialogModiUser(val) {
      val || this.closeUser();
    },

    dialogCancelUser(val) {
      val || this.closeUser();
    },
  },

  methods: {
    // 상태별 색 부여
    getColor(item) {
      if (item === "판매 완료" || item === "거래 완료" || item === "취소") {
        return "red";
      } else return "green";
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

    // 사용자 예약 새고로침
    userRefresh() {
      this.isRefresh = true;
      this.getUserList();
    },

    //상위 컴포넌트로 데이터 전달
    setRsvData(obj) {
      this.$emit("getRsvData", obj);
    },

    //현재 예약자 수(curUserNum), 예약자 총 명단을 가져와서 예약자 명단 테이블에 초기화.
    getUserList() {
      getUserListapi(this.bookId)
        // await this.axios
        //   .get(`${api.url}/books/${this.bookId}/reservations`)
        .then((res) => {
          // console.log(res);
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

          //상위 컴포넌트로 전달할 데이터
          const Rsvobj = {
            totalUserNum: this.totalUserNum,
            cancelUserNum: this.cancelUserNum,
            curUserNum: this.curUserNum,
          };
          this.setRsvData(Rsvobj);
          if (this.isRefresh) {
            this.setSnackbar("예약 목록 새로고침 완료");
            this.isRefresh = !this.isRefresh;
          }
        })
        .catch((err) => {
          this.setSnackbar("예약 목록 조회 실패");
          console.log(err);
        });
    },
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

    modiUsersList(item) {
      const body = {
        isSold: item.isSold,
      };
      if (body.isSold === "거래 완료") {
        body.isSold = true;
      } else {
        body.isSold = false;
      }

      modiUsersListapi(item.id, body)
        // await this.axios
        //   .put(`${api.url}/admin/reservations/${item.id}`, body)
        .then(() => {
          // 바로 변경이 안되는 버그가 있어서 1초 대기
          setTimeout(() => {
            this.getUserList();
          }, 1000);
          this.setSnackbar("예약을 수정하였습니다.");
        })
        .catch((err) => {
          this.setSnackbar("예약 수정 실패");
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

    cancelUsersList(item) {
      cancelUsersListapi(this.bookId, item.id)
        // await this.axios
        //   .delete(`${api.url}/admin/books/${this.bookId}/reservations/${item.id}`)
        .then(() => {
          this.getUserList();
          this.setSnackbar("예약을 취소 하였습니다.");
        })
        .catch((err) => {
          this.setSnackbar("예약 수정 실패");
          this.getUserList();
          console.log(err);
          console.log(err.status);
        });
    },
  },
};
</script>

<style>
.snackbar {
  margin-bottom: 5vh;
}

.userTable {
  display: inline-block;
  width: initial;
  min-width: 100%;
}

.userTableCover {
  overflow-x: scroll;
  white-space: nowrap;
  min-width: 200px;
}
</style>
