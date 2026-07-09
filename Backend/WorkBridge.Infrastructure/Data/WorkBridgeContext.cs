using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using WorkBridge.Domain.Entities;

using WorkBridge.Application.Interfaces;

namespace WorkBridge.Infrastructure.Data;

public partial class WorkBridgeContext : DbContext
{
    public WorkBridgeContext()
    {
    }

    public WorkBridgeContext(DbContextOptions<WorkBridgeContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ApplicantExperience> ApplicantExperiences { get; set; }

    public virtual DbSet<ApplicantProfile> ApplicantProfiles { get; set; }

    
    public virtual DbSet<Branch> Branches { get; set; }

    
    public virtual DbSet<EmployerProfile> EmployerProfiles { get; set; }

    public virtual DbSet<JobCategory> JobCategories { get; set; }

    
   
    public virtual DbSet<ShiftRegistrationWindow> ShiftRegistrationWindows { get; set; }

   
    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<WorkShift> WorkShifts { get; set; }

    
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? "Server=.;Database=WorkBridgeDB;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True";

            optionsBuilder.UseSqlServer(connectionString);
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ApplicantExperience>(entity =>
        {
            entity.HasKey(e => e.ExperienceId).HasName("PK__Applican__2F4E34496C276AD8");

            entity.Property(e => e.CompanyName).HasMaxLength(150);
            entity.Property(e => e.Duration).HasMaxLength(100);
            entity.Property(e => e.Title).HasMaxLength(150);

            
        });

        modelBuilder.Entity<ApplicantProfile>(entity =>
        {
            entity.HasKey(e => e.ApplicantId).HasName("PK__Applican__39AE91A8EAA77268");

            entity.Property(e => e.ApplicantId).ValueGeneratedNever();
            entity.Property(e => e.Address).HasMaxLength(255);
            entity.Property(e => e.Major).HasMaxLength(150);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.StudyYear).HasMaxLength(50);
            entity.Property(e => e.University).HasMaxLength(255);
            entity.Property(e => e.CvUrl).IsUnicode(true);
            entity.Property(e => e.ReputationScore).HasDefaultValue(100);
            entity.Property(e => e.ReportCount).HasDefaultValue(0);

        
        });

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.HasKey(e => e.BranchId);
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.Address).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.HasOne<EmployerProfile>()
                .WithMany()
                .HasForeignKey(e => e.EmployerId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        
        modelBuilder.Entity<EmployerProfile>(entity =>
        {
            entity.HasKey(e => e.EmployerId).HasName("PK__Employer__CA44526143C6B38D");

            entity.Property(e => e.EmployerId).ValueGeneratedNever();
            entity.Property(e => e.Address).HasMaxLength(255);
            entity.Property(e => e.CompanyName).HasMaxLength(255);
            entity.Property(e => e.ContactEmail).HasMaxLength(255);
            entity.Property(e => e.ContactPhone).HasMaxLength(20);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active");

            entity.HasOne(d => d.Employer).WithOne(p => p.EmployerProfile)
                .HasForeignKey<EmployerProfile>(d => d.EmployerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__EmployerP__Emplo__49C3F6B7");
        });

        modelBuilder.Entity<JobCategory>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__JobCateg__19093A0B8EB9ECC2");

            entity.HasIndex(e => e.Name, "UQ__JobCateg__737584F6109B5743").IsUnique();

            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.HasData(
                new JobCategory { CategoryId = 1, Name = "Food & Beverage", Description = "Cafe, restaurants, bars" },
                new JobCategory { CategoryId = 2, Name = "Tutoring", Description = "Academic and skill tutoring" },
                new JobCategory { CategoryId = 3, Name = "Delivery", Description = "Food and parcel delivery services" },
                new JobCategory { CategoryId = 4, Name = "Retail", Description = "Stores, sales assistants" },
                new JobCategory { CategoryId = 5, Name = "Marketing", Description = "Digital marketing, promoters" },
                new JobCategory { CategoryId = 6, Name = "Creative", Description = "Design, photography, writing" },
                new JobCategory { CategoryId = 7, Name = "Office", Description = "Data entry, admin assistants" }
            );
        });

        

        modelBuilder.Entity<ShiftRegistrationWindow>(entity =>
        {
            entity.HasKey(e => e.ShiftRegistrationWindowId);
            entity.Property(e => e.WeekStartDate).HasColumnType("datetime");
            entity.Property(e => e.OpenAt).HasColumnType("datetime");
            entity.Property(e => e.CloseAt).HasColumnType("datetime");
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Open");
            entity.Property(e => e.MinFixedShifts).HasDefaultValue(3);
            entity.Property(e => e.PublishedAt).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.Property(e => e.FinalizedAt).HasColumnType("datetime");
            entity.HasIndex(e => new { e.EmployerId, e.BranchId, e.WeekStartDate }).IsUnique();
            entity.HasOne<EmployerProfile>()
                .WithMany()
                .HasForeignKey(e => e.EmployerId)
                .OnDelete(DeleteBehavior.NoAction);
            entity.HasOne<Branch>()
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.NoAction);
        });

       
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C753B0BDF");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D1053409FCA5A0").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(150);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Active");
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

           
        });

        modelBuilder.Entity<WorkShift>(entity =>
        {
            entity.HasKey(e => e.WorkShiftId);
            entity.Property(e => e.Title).HasMaxLength(150);
            entity.Property(e => e.StartTime).HasColumnType("datetime");
            entity.Property(e => e.EndTime).HasColumnType("datetime");
            entity.Property(e => e.RequiredRole).HasMaxLength(100);
            entity.Property(e => e.RequiredPeople).HasDefaultValue(1);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Published");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())").HasColumnType("datetime");
            entity.HasIndex(e => e.RegistrationWindowId);
            entity.HasOne<EmployerProfile>()
                .WithMany()
                .HasForeignKey(e => e.EmployerId)
                .OnDelete(DeleteBehavior.NoAction);
            entity.HasOne<Branch>()
                .WithMany()
                .HasForeignKey(e => e.BranchId)
                .OnDelete(DeleteBehavior.NoAction);
            entity.HasOne<ShiftRegistrationWindow>()
                .WithMany()
                .HasForeignKey(e => e.RegistrationWindowId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}