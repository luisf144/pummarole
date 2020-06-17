<?php

namespace App\Entity;

use App\Repository\TaskRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=TaskRepository::class)
 * @ORM\HasLifecycleCallbacks
 */
class Task
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $name;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $description;

    /**
     * @ORM\Column(type="datetime")
     */
    private $createdAt;

    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="tasks")
     */
    private $user;

    /**
     * @ORM\OneToMany(targetEntity=Pomodoro::class, mappedBy="task")
     */
    private $pomodoros;

    public function __construct()
    {
        $this->pomodoros = new ArrayCollection();
    }

    /**
     * @ORM\PrePersist
     */
    public function prePersist()
    {
        if(!$this->createdAt){
            $this->createdAt = new \DateTime("now", new \DateTimeZone('Europe/London'));
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    /**
     * @return Collection|Pomodoro[]
     */
    public function getPomodoros(): Collection
    {
        return $this->pomodoros;
    }

    public function addPomodoro(Pomodoro $pomodoro): self
    {
        if (!$this->pomodoros->contains($pomodoro)) {
            $this->pomodoros[] = $pomodoro;
            $pomodoro->setTask($this);
        }

        return $this;
    }

    public function removePomodoro(Pomodoro $pomodoro): self
    {
        if ($this->pomodoros->contains($pomodoro)) {
            $this->pomodoros->removeElement($pomodoro);
            // set the owning side to null (unless already changed)
            if ($pomodoro->getTask() === $this) {
                $pomodoro->setTask(null);
            }
        }

        return $this;
    }
    
}
