using System;

namespace StudiousIndex.API.DTOs
{
    public class CreateVideoLectureDto
    {
        public string Title { get; set; }
        public string ClassLevel { get; set; }
        public string Subject { get; set; }
        public string VideoUrl { get; set; }
    }

    public class VideoLectureResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string ClassLevel { get; set; }
        public string Subject { get; set; }
        public string VideoUrl { get; set; }
        public bool IsApproved { get; set; }
        public string CreatedByTeacherId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
