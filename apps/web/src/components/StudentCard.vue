<template>
	<div class="student-card">
		<div class="avatar-col">
			<div class="avatar-circle">
				<i class="bi bi-person-fill"></i>
			</div>
		</div>

		<div class="info-col">
			<h3 class="student-name">{{ student.name }}</h3>
			<span class="student-ra">{{ student.id }}</span>
		</div>

		<div class="tags-col">
			<span v-for="(tag, index) in student.tags" :key="index" class="tag-badge" :class="getTagColor(index)">
				{{ tag }}
			</span>
		</div>
	</div>
</template>

<script setup>
defineProps({
	student: {
		type: Object,
		required: true
	}
})

const getTagColor = (index) => {
	return index % 2 === 0 ? 'tag-purple' : 'tag-yellow'
}
</script>

<style scoped>
.student-card {
	display: flex;
	align-items: center;
	padding: 1.5rem 2rem;
	background-color: white;
	gap: 1.5rem;
	min-height: 100px;
}

.avatar-col {
	flex-shrink: 0;
}

.avatar-circle {
	width: 60px;
	height: 60px;
	background-color: #1e1e1e;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 2rem;
}

.info-col {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 0;
}

.student-name {
	font-size: 0.95rem;
	font-weight: 700;
	color: #000;
	margin: 0 0 0.25rem 0;
}

.student-ra {
	font-size: 0.85rem;
	font-weight: 400;
	color: #333;
}

.tags-col {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
	justify-content: flex-end;
	max-width: 40%;
}

.tag-badge {
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 0.75rem;
	font-weight: 500;
	white-space: nowrap;
}

.tag-purple {
	background-color: #a68bf7;
	color: #fff;
}

.tag-yellow {
	background-color: #dcd76e;
	color: #5f5a00;
}

@media (max-width: 768px) {
	.student-card {
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem;
	}

	.tags-col {
		justify-content: flex-start;
		max-width: 100%;
	}
}
</style>