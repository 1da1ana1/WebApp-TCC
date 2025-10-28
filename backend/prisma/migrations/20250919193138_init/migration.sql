-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tipoUsuario" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Keyword" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserKeyword" (
    "userId" INTEGER NOT NULL,
    "keywordId" INTEGER NOT NULL,

    CONSTRAINT "UserKeyword_pkey" PRIMARY KEY ("userId","keywordId")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" SERIAL NOT NULL,
    "ra" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Teacher" (
    "id" SERIAL NOT NULL,
    "linkLattes" TEXT,
    "isCoordinator" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Coordinator" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,

    CONSTRAINT "Coordinator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Solicitation" (
    "id" SERIAL NOT NULL,
    "dataEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "justificativaRecusa" TEXT,
    "studentId" INTEGER NOT NULL,
    "teacherId" INTEGER,

    CONSTRAINT "Solicitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Orientation" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3),
    "dataConclusao" TIMESTAMP(3),
    "semesterId" INTEGER,
    "supervisorId" INTEGER,

    CONSTRAINT "Orientation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrientationMember" (
    "id" SERIAL NOT NULL,
    "orientationId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,

    CONSTRAINT "OrientationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Semester" (
    "id" SERIAL NOT NULL,
    "ano" INTEGER NOT NULL,
    "periodo" TEXT NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contestation" (
    "id" SERIAL NOT NULL,
    "motivoContestacao" TEXT NOT NULL,
    "coordinatorId" INTEGER NOT NULL,

    CONSTRAINT "Contestation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vacancy" (
    "id" SERIAL NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "coordinatorId" INTEGER NOT NULL,

    CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_StudentOrientations" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StudentOrientations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_nome_key" ON "public"."Keyword"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Student_ra_key" ON "public"."Student"("ra");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "public"."Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "public"."Teacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Coordinator_teacherId_key" ON "public"."Coordinator"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "OrientationMember_orientationId_teacherId_key" ON "public"."OrientationMember"("orientationId", "teacherId");

-- CreateIndex
CREATE INDEX "_StudentOrientations_B_index" ON "public"."_StudentOrientations"("B");

-- AddForeignKey
ALTER TABLE "public"."UserKeyword" ADD CONSTRAINT "UserKeyword_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserKeyword" ADD CONSTRAINT "UserKeyword_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "public"."Keyword"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Coordinator" ADD CONSTRAINT "Coordinator_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Solicitation" ADD CONSTRAINT "Solicitation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Solicitation" ADD CONSTRAINT "Solicitation_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orientation" ADD CONSTRAINT "Orientation_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orientation" ADD CONSTRAINT "Orientation_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrientationMember" ADD CONSTRAINT "OrientationMember_orientationId_fkey" FOREIGN KEY ("orientationId") REFERENCES "public"."Orientation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrientationMember" ADD CONSTRAINT "OrientationMember_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contestation" ADD CONSTRAINT "Contestation_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "public"."Coordinator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vacancy" ADD CONSTRAINT "Vacancy_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "public"."Coordinator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_StudentOrientations" ADD CONSTRAINT "_StudentOrientations_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Orientation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_StudentOrientations" ADD CONSTRAINT "_StudentOrientations_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
