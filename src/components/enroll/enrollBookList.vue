<template>
  <v-container>
    <v-row>
      <v-col class="bookTableCover">
        <v-data-table
          :headers="headers"
          :items="tableData"
          :search="search"
          class="elevation-1 bookTable"
          mobile-breakpoint="0"
          @click:row="link"
        >
          <template v-slot:top>
            <v-toolbar flat class="toolbar">
              <v-container>
                <v-row>
                  <v-col cols="3" class="table-title-col">
                    <v-toolbar-title> 목록 </v-toolbar-title>
                    <v-divider vertical class="ml-4 mr-4" />
                    <v-toolbar-title>등록 수량 : {{ dataNum }}</v-toolbar-title>
                  </v-col>
                  <v-col cols="7" class="search-field-col">
                    <v-text-field
                      v-model="search"
                      append-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                    ></v-text-field>
                  </v-col>

                  <!-- <v-spacer></v-spacer>
              <v-spacer></v-spacer> -->
                  <v-col class="addBtn-col">
                    <v-dialog persistent v-model="dialog" max-width="500px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="primary"
                          dark
                          class="mb-2 addBtn"
                          v-bind="attrs"
                          v-on="on"
                        >
                          추가하기
                        </v-btn>
                      </template>

                      <!-- 추가하기 v-dialog 출력부분 -->
                      <v-card>
                        <v-card-title>
                          <span class="headline">{{ formTitle }}</span>
                        </v-card-title>

                        <v-card-text>
                          <v-container>
                            <v-row>
                              <v-col cols="12" sm="6" md="4">
                                <v-text-field
                                  v-model="editedItem.title"
                                  label="title"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" sm="6" md="4">
                                <v-text-field
                                  v-model="editedItem.publisher"
                                  label="publisher"
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12" sm="6" md="4">
                                <v-text-field
                                  v-model="editedItem.author"
                                  label="author"
                                ></v-text-field>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card-text>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="blue darken-1" text @click="close">
                            취소
                          </v-btn>
                          <v-btn color="blue darken-1" text @click="save">
                            저장
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                      <!-- 추가하기 v-dialog 출력부분 -->
                    </v-dialog>
                  </v-col>
                </v-row>
              </v-container>

              <!-- 삭제버튼(쓰레기통 아이콘) 클릭 시 출력되는 다이얼로그 -->
              <v-dialog persistent v-model="dialogDelete" max-width="500px">
                <v-card style="text-align: center">
                  <v-card-title class="headline"
                    >삭제하시겠습니까?</v-card-title
                  >
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDelete"
                      >아니오</v-btn
                    >
                    <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                      >네</v-btn
                    >
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <!-- 삭제버튼(쓰레기통 아이콘) 클릭 시 출력되는 다이얼로그 -->

          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editItem(item)">
              mdi-pencil
            </v-icon>
            <v-icon small @click.stop="deleteItem(item)"> mdi-delete </v-icon>
          </template>
          <template v-slot:no-data>
            <div v-if="dataLength === null">
              <v-progress-linear indeterminate color="cyan"></v-progress-linear>
            </div>
            <div v-else>없음</div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {
  getBooksList,
  deleteBook,
  addNewBooks,
  modifyBook,
} from "../../api/api";
export default {
  data: () => ({
    dialog: false,
    dialogDelete: false,
    search: "",
    dataLength: 0,
    headers: [
      { text: "title", value: "title", align: "center", sortable: true },
      { text: "publisher", value: "publisher", align: "center" },
      { text: "author", value: "author", align: "center" },
      { text: "stocks", value: "stockCount", sortable: false, align: "center" },
      {
        text: "reservations",
        value: "reservationCount",
        sortable: false,
        align: "center",
      },
      { text: "Actions", value: "actions", sortable: false, align: "center" },
    ],
    data: [],
    dataNum: 0,
    tableData: [],
    reservationCount: 0,
    stockCount: 0,
    editedIndex: -1,
    editedItem: {
      title: "",
      publisher: "",
      author: "",
      stocks: "",
    },
    defaultItem: {
      title: "",
      publisher: "",
      author: "",
      stocks: "",
    },
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Book" : "Edit Book";
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    link(row) {
      if (!this.dialog && !this.dialogDelete) {
        this.$router.push({
          name: "showDetail",
          params: {
            id: row.id,
            publisher: row.publisher,
            author: row.author,
            title: row.title,
          },
        });
      }
    },
    initialize() {
      getBooksList()
        .then((res) => {
          console.log(res);
          this.dataNum = res.data.length;
          this.tableData = [];
          this.data = res.data;
          this.dataLength = res.data.length;
          for (let i = 0; i < this.dataLength; i++) {
            this.reservationCount =
              this.data[i].reservationCountA +
              this.data[i].reservationCountB +
              this.data[i].reservationCountC;
            this.stockCount =
              this.data[i].stockCountA +
              this.data[i].stockCountB +
              this.data[i].stockCountC;
            this.tableData.push({
              id: this.data[i].id,
              title: this.data[i].title,
              publisher: this.data[i].publisher,
              author: this.data[i].author,
              stockCount: this.stockCount,
              reservationCount: this.reservationCount,
            });
          }
        })
        .catch((err) => {
          alert("조회 실패");
          console.log(err);
          console.log(err.response);
          console.log(err.config);
        });
    },
    editItem(item) {
      this.editedIndex = this.tableData.indexOf(item);
      console.log(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    deleteItem(item) {
      this.editedIndex = this.tableData.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      // console.log(this.data[this.editedIndex].id);
      deleteBook({ bookId: this.data[this.editedIndex].id })
        .then(() => {
          alert("삭제되었습니다.");
          this.initialize();
        })
        .catch((res) => {
          console.log(res);
          alert("삭제 실패");
        });
      this.closeDelete();
    },
    close() {
      this.dialog = false;
      // 모든 데이터와 DOM이 업데이트 된 이후에 실행하기 위해 nextTick()콜백함수 사용
      // 자바스크립트의 비동기 처리에 의한 에러를 방지하기 위해
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    closeDelete() {
      this.dialogDelete = false;
      // 모든 데이터와 UI, DOM이 업데이트 된 이후에 실행하기 위해 nextTick()콜백함수 사용
      // 자바스크립트의 비동기 처리에 의한 에러를 방지하기 위해
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    save() {
      if (this.editedIndex > -1) {
        // Object.assign(this.data[this.editedIndex], this.editedItem)
        console.log(this.data[this.editedIndex].id);
        modifyBook({
          bookId: this.data[this.editedIndex].id,
          data: {
            title: this.editedItem.title,
            publisher: this.editedItem.publisher,
            author: this.editedItem.author,
          },
        })
          .then(() => {
            alert("수정되었습니다.");
            this.initialize();
          })
          .catch((err) => {
            alert("수정 실패");
            console.log(err);
          });
      } else {
        addNewBooks({
          data: {
            title: this.editedItem.title,
            publisher: this.editedItem.publisher,
            author: this.editedItem.author,
          },
        })
          .then(() => {
            alert("등록되었습니다.");
            this.initialize();
          })
          .catch((err) => {
            alert("등록 실패");
            console.log(err);
          });
      }
      this.close();
    },
  },
};
</script>

<style>
tbody > tr {
  cursor: pointer;
}
.bookTableCover {
  overflow: hidden;
}
.table-title-col {
  display: flex;
  align-items: center;
}
.v-toolbar__title {
  height: 60%;
}
.search-field-col {
  display: flex;
  justify-content: center;
  align-items: center;
}
.addBtn-col {
  display: flex;
  justify-content: center;
  align-items: center;
}
.addBtn {
  width: 100%;
  height: 100%;
}
</style>
