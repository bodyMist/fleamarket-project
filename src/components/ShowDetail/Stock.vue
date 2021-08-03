<template>
  <!-- 재고 현황 -->
  <v-col cols="12" md="6">
    <label>
      <h1>재고 현황</h1>
    </label>
    <v-card class="cover">
      <v-card-title>
        <v-col offset="1"> 총 재고 수 </v-col>
        <v-col>
          <h3>{{ totalBookNum }}</h3>
        </v-col>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-title>
        <v-col offset="1"> 판매 진행중 </v-col>
        <v-col>
          <h3>{{ curBookNum }}</h3>
        </v-col>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-title>
        <v-col offset="1"> 판매 완료 </v-col>
        <v-col>
          <h3>{{ totalBookNum - curBookNum }}</h3>
        </v-col>
      </v-card-title>
    </v-card>
  </v-col>
</template>

<script>
export default {
  props: {
    totalBookNum: Number,
    curBookNum: Number,
  },
};
</script>

<style></style>
