<template>
  <v-container>
    <!-- 책 정보 -->
    <v-col cols="12">
      <v-card class="cover">
        <v-card-title>
          <v-col offset-sm="1" offset-md="4" cols="3"> 책이름 </v-col>
          <v-col>
            <h3>{{ this.bookTitle }}</h3>
          </v-col>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-title>
          <v-col offset-sm="1" offset-md="4" cols="3"> 저자 </v-col>
          <v-col>
            <h3>{{ this.bookAuthor }}</h3>
          </v-col>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-title>
          <v-col offset-sm="1" offset-md="4" cols="3"> 출판사 </v-col>
          <v-col>
            <h3>{{ this.bookPublisher }}</h3>
          </v-col>
        </v-card-title>
      </v-card>
    </v-col>
  </v-container>
</template>

<script>
export default {
  props: {
    bookTitle: String,
    bookAuthor: String,
    bookPublisher: String,
  },
};
</script>

<style></style>
