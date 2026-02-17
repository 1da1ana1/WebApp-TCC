-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "typeUser" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserKeyword" (
    "userId" INTEGER NOT NULL,
    "keywordId" INTEGER NOT NULL,

    CONSTRAINT "UserKeyword_pkey" PRIMARY KEY ("userId","keywordId")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "ra" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" SERIAL NOT NULL,
    "lattesLink" TEXT,
    "isCoordinator" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coordinator" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,

    CONSTRAINT "Coordinator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "sendDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "denialJustification" TEXT,
    "studentId" INTEGER NOT NULL,
    "teacherId" INTEGER,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orientation" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "semesterId" INTEGER,
    "supervisorId" INTEGER,

    CONSTRAINT "Orientation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrientationMember" (
    "id" SERIAL NOT NULL,
    "orientationId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,

    CONSTRAINT "OrientationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "period" TEXT NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contestation" (
    "id" SERIAL NOT NULL,
    "contestationReason" TEXT NOT NULL,
    "coordinatorId" INTEGER NOT NULL,

    CONSTRAINT "Contestation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vacancy" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "coordinatorId" INTEGER NOT NULL,

    CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StudentOrientations" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StudentOrientations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_name_key" ON "Keyword"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Student_ra_key" ON "Student"("ra");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "Teacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Coordinator_teacherId_key" ON "Coordinator"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "OrientationMember_orientationId_teacherId_key" ON "OrientationMember"("orientationId", "teacherId");

-- CreateIndex
CREATE INDEX "_StudentOrientations_B_index" ON "_StudentOrientations"("B");

-- AddForeignKey
ALTER TABLE "UserKeyword" ADD CONSTRAINT "UserKeyword_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKeyword" ADD CONSTRAINT "UserKeyword_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coordinator" ADD CONSTRAINT "Coordinator_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orientation" ADD CONSTRAINT "Orientation_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orientation" ADD CONSTRAINT "Orientation_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrientationMember" ADD CONSTRAINT "OrientationMember_orientationId_fkey" FOREIGN KEY ("orientationId") REFERENCES "Orientation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrientationMember" ADD CONSTRAINT "OrientationMember_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contestation" ADD CONSTRAINT "Contestation_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "Coordinator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vacancy" ADD CONSTRAINT "Vacancy_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "Coordinator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentOrientations" ADD CONSTRAINT "_StudentOrientations_A_fkey" FOREIGN KEY ("A") REFERENCES "Orientation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentOrientations" ADD CONSTRAINT "_StudentOrientations_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
