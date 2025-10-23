<template>
  <HeaderMenu />
</template>

<script>
  import { defineComponent } from 'vue';
  import CronogramSchedule from './components/CronogramSchedule.vue';
  import FilterBar from './components/FilterBar.vue';
  import HeaderMenu from './components/HeaderMenu.vue';
  import SearchBar from './components/SearchBar.vue';
  import SearchResult from './components/SearchResult.vue';
  import SideBar from './components/SideBar.vue';
  import UserCard from './components/UserCard.vue';
  import UserProfile from './components/UserProfile.vue';
  import UserProfileMenu from './components/UserProfileMenu.vue';
  import UserRegisterTags from './components/UserRegisterTags.vue';

  export default defineComponent({
    name: 'App',
    components: {
    CronogramSchedule, 
    FilterBar,
    HeaderMenu,
    SearchBar,
    SearchResult,
    SideBar,
    UserCard,
    UserProfile,
    UserProfileMenu, 
    UserRegisterTags
    }
  })

</script>