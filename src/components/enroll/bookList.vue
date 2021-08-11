<template>
  <v-container>
    <v-row>
      <v-col class="bookTableCover">
        <v-data-table
          :headers="headers"
          :items="data"
          :search="search"
          class="elevation-1 bookTable"
          mobile-breakpoint="0"
          @click:row="link"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-container>
                <v-row>
                  <v-col cols="3">
                    <v-toolbar-title> 목록 </v-toolbar-title>
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="search"
                      append-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
              <v-spacer></v-spacer>
              <!-- <v-divider class="mx-4" inset vertical></v-divider> -->
              <!-- <v-divider class="mx-4" inset vertical></v-divider> -->
              <v-spacer></v-spacer>
              <v-dialog persistent v-model="dialog" max-width="500px">
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
              </v-dialog>
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
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editItem(item)">
              mdi-pencil
            </v-icon>
            <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
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
import { getBooksList, deleteBook, addNewBooks, modifyBook } from "../../api/api";

export default {
  data: () => ({
    dialog: false,
    dialogDelete: false,
    sendID: "",
    sendPublisher: "",
    sendAuthor: "",
    sendTitle: "",
    search: "",
    dataLength: null,
    headers: [
      { text: "title", align: "center", sortable: true, value: "title"},
      { text: "publisher", value: "publisher", align: "center" },
      { text: "author", value: "author", align: "center" },
      { text: "stocks", value: "stockCount", sortable: false, align: "center" },
      { text: "reservations", value: "reservationCount", sortable: false, align: "center"},
      { text: "Actions", value: "actions", sortable: false, align: "center" },
    ],
    data: [],
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
          this.data = res.data;
          this.dataLength = res.data.length;
        })
        .catch((err) => {
          alert("조회 실패");
          console.log(err);
        });
    },

    editItem(item) {
      this.editedIndex = this.data.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.data.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      // console.log(this.data[this.editedIndex].id);
      deleteBook({bookId : this.data[this.editedIndex].id})
        .then(() => {
          alert("삭제되었습니다.");

          this.data.splice(this.editedIndex, 1);
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
      // console.log('close()');
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    save() {
      if (this.editedIndex > -1) {
        // Object.assign(this.data[this.editedIndex], this.editedItem)
        console.log(this.data[this.editedIndex].id);
        modifyBook({bookId:this.data[this.editedIndex].id, data:{title: this.editedItem.title, publisher: this.editedItem.publisher, author: this.editedItem.author}})
          .then(() => {
            alert("수정되었습니다.");
            this.initialize();
          })
          .catch((res) => {
            alert("수정 실패");
            console.log(res);
          });
      } else {
        addNewBooks({data:{ title: this.editedItem.title, publisher: this.editedItem.publisher, author: this.editedItem.author,}})
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
</style>