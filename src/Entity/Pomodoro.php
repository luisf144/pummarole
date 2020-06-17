<?php

namespace App\Entity;

use App\Repository\PomodoroRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\HasLifecycleCallbacks
 * @ORM\Entity(repositoryClass=PomodoroRepository::class)
 */
class Pomodoro
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
    private $type;

    /**
     * @ORM\Column(type="datetime")
     */
    private $createdAt;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $length;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $finishedAt;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $pausedAt;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $modifiedAt;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private $secRemaining;

    /**
     * @ORM\Column(type="integer", options={"default":0})
     */
    private $pomRound = 0;

    /**
     * @ORM\Column(type="boolean", options={"default":false})
     */
    private $completed = false;

    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="pomodoros")
     */
    private $user;

    /**
     * @ORM\ManyToOne(targetEntity=Task::class, inversedBy="pomodoros")
     */
    private $task;

    public function getData(){
        return [
            'id' => $this->getId(),
            'createdAt' => $this->getCreatedAt(),
            'pomLength' => $this->getLength(),
            'pomType' => $this->getType(),
            'pausedAt' => $this->getPausedAt(),
            'modifiedAt' => $this->getModifiedAt(),
            'finishedAt' => $this->getFinishedAt(),
            'secRemaining' => $this->getSecRemaining(),
            'pomRound' => $this->getPomRound(),
            'pomCompleted' => $this->getCompleted(),
            'idTask' => $this->getTask() ? $this->getTask()->getId() : null
        ];
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

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

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

    public function getLength(): ?string
    {
        return $this->length;
    }

    public function setLength(string $length): self
    {
        $this->length = $length;

        return $this;
    }

    public function getFinishedAt(): ?\DateTimeInterface
    {
        return $this->finishedAt;
    }

    public function setFinishedAt(\DateTimeInterface $finishedAt): self
    {
        $this->finishedAt = $finishedAt;

        return $this;
    }

    public function getPausedAt(): ?\DateTimeInterface
    {
        return $this->pausedAt;
    }

    public function setPausedAt(?\DateTimeInterface $pausedAt): self
    {
        $this->pausedAt = $pausedAt;

        return $this;
    }

    public function getSecRemaining(): ?int
    {
        return $this->secRemaining;
    }

    public function setSecRemaining($secRemaining): self
    {
        $this->secRemaining = $secRemaining;

        return $this;
    }

    public function getModifiedAt(): ?\DateTimeInterface
    {
        return $this->modifiedAt;
    }

    public function setModifiedAt(?\DateTimeInterface $modifiedAt): self
    {
        $this->modifiedAt = $modifiedAt;

        return $this;
    }

    public function getPomRound(): ?int
    {
        return $this->pomRound;
    }

    public function setPomRound(int $pomRound): self
    {
        $this->pomRound = $pomRound;

        return $this;
    }

    public function getCompleted(): ?bool
    {
        return $this->completed;
    }

    public function setCompleted(bool $completed): self
    {
        $this->completed = $completed;

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

    public function getTask(): ?Task
    {
        return $this->task;
    }

    public function setTask(?Task $task): self
    {
        $this->task = $task;

        return $this;
    }
}
